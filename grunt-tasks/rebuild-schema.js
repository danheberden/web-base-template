module.exports = function( grunt ) {

    grunt.registerTask('rebuild-schema', 'Drop and rebuild the wordpress database schema.', function() {
        var done = this.async();

        var CONFIG_FILE = '../wp-config.php';
        console.log('\tParsing Wordpress Config: ' + CONFIG_FILE);

        var fs = require('fs');

        var wp_config = fs.readFileSync( CONFIG_FILE ).toString();
        var db_conn = parseDatabaseConnectionInfo(wp_config);

        console.log('\tDropping Schema: ' + db_conn.schema );
        db_conn.debug = true;

        var db = require("mysql-native").createTCPClient(db_conn.host, db_conn.port);
        db.auto_prepare = true;

        console.log("\tLogging in " + db_conn.user + "@" + db_conn.host);
        db.auth(db_conn.schema, db_conn.user, db_conn.password);

        console.log('\tDropping Schema: ' + db_conn.schema );
        db.query("DROP SCHEMA jQuery");

        console.log('\tCreating Schema: ' + db_conn.schema );
        db.query("CREATE SCHEMA jQuery");

        console.log('\tClosing Connection');
        db.close();

    });

    function parseDatabaseConnectionInfo(input) {

        var result = { port:8889 };
        var lines = input.split( '\n' );

        for (var x=0; x<lines.length; x++) {

            var line = lines[x];

            if ( line.search('DB_NAME') >= 0 ) {
                result.schema = parseLineValue( line );
            }
            else if ( line.search('DB_USER') >= 0 ) {
                result.user = parseLineValue( line );
            }
            else if ( line.search('DB_PASSWORD') >= 0 ) {
                result.password = parseLineValue( line );
            }
            else if ( line.search('DB_HOST') >= 0 ) {
                result.host = parseLineValue( line );
            }
        }

        return result;
    }

    function parseLineValue(input) {
        var tokens = input.split(",");
        if ( tokens.length > 1 ) {
            var result = tokens[1].replace(' ', '');
            result = result.replace(/\'/g, '');
            result = result.replace(/\r/g, '');
            result = result.replace(')', '');
            result = result.replace(';', '');
        }
        return result;
    }
};


