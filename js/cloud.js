const {dialog} = require("electron").remote;
const {remote} = require('electron');

document.getElementById('title').innerText = "Cloud Visualization for "
    + remote.getGlobal('shareObj').filename;

let filepath = remote.getGlobal('shareObj').filepath;

/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Description: A THREE loader for PCD ascii and binary files.
 *
 * Limitations: Compressed binary files are not supported.
 *
 */

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const cloudSettings = require('./config/label_settings');

THREE.PCDLoader = function ( manager ) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    this.littleEndian = true;
};


THREE.PCDLoader.prototype = {

    constructor: THREE.PCDLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var loader = new THREE.FileLoader( scope.manager );
        loader.setPath( scope.path );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, function ( data ) {

            try {
                onLoad( scope.parse( data, url ) );
            } catch ( e ) {
                if ( onError ) {
                    onError( e );
                } else {
                    throw e;
                }
            }
        }, onProgress, onError );
    },

    setPath: function ( value ) {
        this.path = value;
        return this;
    },

    parse: function ( data, url ) {
        function parseHeader( data ) {
            var PCDheader = {};
            var result1 = data.search( /[\r\n]DATA\s(\S*)\s/i );
            var result2 = /[\r\n]DATA\s(\S*)\s/i.exec( data.substr( result1 - 1 ) );

            PCDheader.data = result2[ 1 ];
            PCDheader.headerLen = result2[ 0 ].length + result1;
            PCDheader.str = data.substr( 0, PCDheader.headerLen );

            // remove comments
            PCDheader.str = PCDheader.str.replace( /\#.*/gi, '' );

            // parse
            require('electron').remote.getGlobal('shareObj').headers = PCDheader.str;
            console.log("Hello " + PCDheader.str);
            PCDheader.version = /VERSION (.*)/i.exec( PCDheader.str );
            PCDheader.fields = /FIELDS (.*)/i.exec( PCDheader.str );
            PCDheader.size = /SIZE (.*)/i.exec( PCDheader.str );
            PCDheader.type = /TYPE (.*)/i.exec( PCDheader.str );
            PCDheader.count = /COUNT (.*)/i.exec( PCDheader.str );
            PCDheader.width = /WIDTH (.*)/i.exec( PCDheader.str );
            PCDheader.height = /HEIGHT (.*)/i.exec( PCDheader.str );
            PCDheader.viewpoint = /VIEWPOINT (.*)/i.exec( PCDheader.str );
            PCDheader.points = /POINTS (.*)/i.exec( PCDheader.str );

            // evaluate
            if ( PCDheader.version !== null )
                PCDheader.version = parseFloat( PCDheader.version[ 1 ] );

            if ( PCDheader.fields !== null )
                PCDheader.fields = PCDheader.fields[ 1 ].split( ' ' );

            if ( PCDheader.type !== null )
                PCDheader.type = PCDheader.type[ 1 ].split( ' ' );

            if ( PCDheader.width !== null )
                PCDheader.width = parseInt( PCDheader.width[ 1 ] );

            if ( PCDheader.height !== null )
                PCDheader.height = parseInt( PCDheader.height[ 1 ] );

            if ( PCDheader.viewpoint !== null )
                PCDheader.viewpoint = PCDheader.viewpoint[ 1 ];

            if ( PCDheader.points !== null )
                PCDheader.points = parseInt( PCDheader.points[ 1 ], 10 );

            if ( PCDheader.points === null )
                PCDheader.points = PCDheader.width * PCDheader.height;

            if ( PCDheader.size !== null ) {
                PCDheader.size = PCDheader.size[ 1 ].split( ' ' ).map( function ( x ) {
                    return parseInt( x, 10 );
                } );
            }

            if ( PCDheader.count !== null ) {
                PCDheader.count = PCDheader.count[ 1 ].split( ' ' ).map( function ( x ) {
                    return parseInt( x, 10 );
                });
            } else {
                PCDheader.count = [];
                for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {
                    PCDheader.count.push( 1 );
                }
            }

            PCDheader.offset = {};

            var sizeSum = 0;
            for ( var i = 0, l = PCDheader.fields.length; i < l; i ++ ) {
                if ( PCDheader.data === 'ascii' ) {
                    PCDheader.offset[ PCDheader.fields[ i ] ] = i;
                } else {
                    PCDheader.offset[ PCDheader.fields[ i ] ] = sizeSum;
                    sizeSum += PCDheader.size[ i ];
                }
            }

            // for binary only
            PCDheader.rowSize = sizeSum;
            return PCDheader;
        }
        var textData = THREE.LoaderUtils.decodeText( data );

        // parse header (always ascii format)
        var PCDheader = parseHeader( textData );

        // parse data
        var position = [];
        var normal = [];
        var color = [];

        // ascii
        if ( PCDheader.data === 'ascii' ) {
            var offset = PCDheader.offset;
            var pcdData = textData.substr( PCDheader.headerLen );
            var lines = pcdData.split( '\n' );

            for ( var i = 0, l = lines.length; i < l; i ++ ) {
                if ( lines[ i ] === '' ) continue;
                var line = lines[ i ].split( ' ' );

                if ( offset.x !== undefined ) {
                    position.push( parseFloat( line[ offset.x ] ) );
                    position.push( parseFloat( line[ offset.y ] ) );
                    position.push( parseFloat( line[ offset.z ] ) );
                }

                if ( offset.label !== undefined ) {
                    if (line[offset.label] === '0')
                        color.push(... cloudSettings.points.color.zero);
                    else if (line[offset.label] === '1')
                        color.push(... cloudSettings.points.color.one);
                    else if (line[offset.label] === '2')
                        color.push(... cloudSettings.points.color.two);
                    else if (line[offset.label] === '3')
                        color.push(... cloudSettings.points.color.three);
                    else if (line[offset.label] === '4')
                        color.push(... cloudSettings.points.color.four);
                    else
                        color.push(... cloudSettings.points.color.other);
                } else
                    color.push(... cloudSettings.points.color.zero);

                if ( offset.rgb !== undefined ) {
                    var rgb = parseFloat( line[ offset.rgb ] );
                    var r = ( rgb >> 16 ) & 0x0000ff;
                    var g = ( rgb >> 8 ) & 0x0000ff;
                    var b = ( rgb >> 0 ) & 0x0000ff;
                    color.push( r / 255, g / 255, b / 255 );
                }

                if ( offset.normal_x !== undefined ) {
                    normal.push( parseFloat( line[ offset.normal_x ] ) );
                    normal.push( parseFloat( line[ offset.normal_y ] ) );
                    normal.push( parseFloat( line[ offset.normal_z ] ) );
                }
            }
        }

        // binary
        if ( PCDheader.data === 'binary_compressed' ) {
            error = 'THREE.PCDLoader: binary_compressed files are not supported';
            dialog.showErrorBox('This is a binary compressed pcd file',error);
            console.error(error);
            return;

        }

        if ( PCDheader.data === 'binary' ) {
            var dataview = new DataView( data, PCDheader.headerLen );
            var offset = PCDheader.offset;
            for ( var i = 0, row = 0; i < PCDheader.points; i ++, row += PCDheader.rowSize ) {
                if ( offset.x !== undefined ) {
                    position.push( dataview.getFloat32( row + offset.x, this.littleEndian ) );
                    position.push( dataview.getFloat32( row + offset.y, this.littleEndian ) );
                    position.push( dataview.getFloat32( row + offset.z, this.littleEndian ) );
                }

                if ( offset.rgb !== undefined ) {
                    color.push( dataview.getUint8( row + offset.rgb + 2 ) / 255.0 );
                    color.push( dataview.getUint8( row + offset.rgb + 1 ) / 255.0 );
                    color.push( dataview.getUint8( row + offset.rgb + 0 ) / 255.0 );
                }

                if ( offset.normal_x !== undefined ) {
                    normal.push( dataview.getFloat32( row + offset.normal_x, this.littleEndian ) );
                    normal.push( dataview.getFloat32( row + offset.normal_y, this.littleEndian ) );
                    normal.push( dataview.getFloat32( row + offset.normal_z, this.littleEndian ) );
                }
                color.push(... cloudSettings.points.color.zero);
            }
        }

        // build geometry
        var geometry = new THREE.BufferGeometry();
        if ( position.length > 0 )
            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
        if ( normal.length > 0 )
            geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normal, 3 ) );

        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( color, 3 ) );


        geometry.computeBoundingSphere();

        // build material
        var material = new THREE.PointsMaterial( { size: cloudSettings.points.size } );
        material.vertexColors = THREE.VertexColors;

        // build mesh
        var mesh = new THREE.Points( geometry, material );
        var name = url.split( '' ).reverse().join( '' );
        name = /([^\/]*)/.exec( name );
        name = name[ 1 ].split( '' ).reverse().join( '' );
        mesh.name = name;
        return mesh;
    }
};

const plotCloud = (mesh) => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera();
    camera.up.set(... cloudSettings.camera.up);
    camera.position.set(20, 20, 20);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableKeys = true;
    controls.keyPanSpeed = 20.0;
    document.body.appendChild( renderer.domElement );
    controls.update();

    // show axis
    var axesHelper = new THREE.AxesHelper(5);
    scene.add( axesHelper );

    // show cloud
    scene.add(mesh);


    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );
    }
    animate();

    display_panels();
};

let loader = new THREE.PCDLoader();
loader.load(filepath,
    plotCloud, null, (error) => {
        dialog.showErrorBox('PCDLoader Error', error.toString());
        console.log(error.toString());
    });


