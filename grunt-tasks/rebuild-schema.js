module.exports = function( grunt ) {
    grunt.registerHelper('rebuild-schema', function() {

        var CONFIG_FILE = '../wp-config.php';
        console.log('\tParsing Wordpress Config: ' + CONFIG_FILE);

        var fs = require('fs');

        var wp_config = fs.readFileSync( CONFIG_FILE ).toString();
        var db_conn = parseDatabaseConnectionInfo(wp_config);



        console.log('\tDropping Schema: ' + db_conn.schema );



    });
};



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