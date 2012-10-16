module.exports = function( grunt ) {

    var wpconfig = require("./wpconfigParser.js");
    var fs = require('fs');
    var mysql = require("mysql-native");
    var prompt = require('prompt');

    var AUTH_TIMEOUT_MS = 15000;
    var DEFAULT_MYSQL_PORTS = [3306,8889];
    var WORDPRESS_CONFIG_FILE = '../wp-config.php';

    var portIndex = 0;
    var db_conn = undefined;
    var db = undefined;
    var done = undefined;

    grunt.registerTask('rebuild-schema', 'Drop and rebuild the wordpress database schema.', function() {
        done = this.async();

        console.log('\tParsing Wordpress Config: ' + WORDPRESS_CONFIG_FILE);
        var wp_config = fs.readFileSync( WORDPRESS_CONFIG_FILE ).toString();
        try {
            db_conn = wpconfig.parseConnectionInfo(wp_config);
            db_conn.debug = true;
        }
        catch (e){
            console.log( "\tERROR: " + e.toString() );
            terminate();
        }

        createConnection();
        authorize();
    });

    function createConnection() {

        var port;
        if ( db_conn.port != undefined ) {
            port = db_conn.port;
            portIndex = -1;
        }
        if ( portIndex >= 0 ) {
            port = DEFAULT_MYSQL_PORTS[portIndex];
        }

        console.log("\tCreating connection to MySQL database " + db_conn.user + "@" + db_conn.host + ":" + port );
        db = mysql.createTCPClient(db_conn.host, port);
        db.auto_prepare = true;
        db.addListener('error', function() {
            handleFailedAuth();
        });
    }

    function authorize() {

        var authTimeout = setTimeout(function(event){
            terminate();
        }, AUTH_TIMEOUT_MS);

        var authRequest = db.auth(db_conn.schema, db_conn.user, db_conn.password);

        authRequest.addListener('authorized', function() {
            clearTimeout(authTimeout);
            handleSuccessAuth();
        });

        authRequest.addListener('error', function() {
            clearTimeout(authTimeout);
            handleFailedAuth();
        });
    }

    function handleSuccessAuth() {

        console.log('\tDropping Schema: ' + db_conn.schema );
        db.query("DROP SCHEMA " + db_conn.schema);

        console.log('\tCreating Schema: ' + db_conn.schema );
        db.query("CREATE SCHEMA " + db_conn.schema);

        console.log('\tClosing Connection');
        db.close();
        done(true);
    }


    function handleFailedAuth() {
        console.log("\t\tFAILED");
        if ( portIndex >=0 && portIndex < DEFAULT_MYSQL_PORTS.length-1 ) {
            portIndex++;

            createConnection();
            authorize();
        }
        else if (portIndex == DEFAULT_MYSQL_PORTS.length-1) {
            portIndex = -1;
            console.log("\tPlease specify the port that MySQL is using.");
            prompt.get(['port'], function (err, result) {

                db_conn.port = result.port;
                createConnection();
                authorize();
            })
        }
        else {
            terminate();
        }
    }

    function terminate() {
        if (db) {
            console.log("\tUNABLE TO AUTHORIZE USER");
            db.close();
        }
        done(false);
    }

};


