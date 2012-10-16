module.exports = {

    parseConnectionInfo : function(input) {

        var result = { };
        var lines = input.split( '\n' );

        for (var x=0; x<lines.length; x++) {

            var line = lines[x];

            if ( line.search('DB_NAME') >= 0 ) {
                result.schema = this.parseLineValue( line );
            }
            else if ( line.search('DB_USER') >= 0 ) {
                result.user = this.parseLineValue( line );
            }
            else if ( line.search('DB_PASSWORD') >= 0 ) {
                result.password = this.parseLineValue( line );
            }
            else if ( line.search('DB_HOST') >= 0 ) {
                result.host = this.parseLineValue( line );
                if ( result.host.search(":") >= 0 ){
                    var tokens = result.host.split(":");
                    if ( tokens.length == 2){
                        result.host = tokens[0].replace(/^\s+|\s+$/g,'');
                        result.port = tokens[1].replace(/^\s+|\s+$/g,'');
                    }
                    else {
                        throw new Error("Invalid Host/Port");
                    }
                }
            }
        }

        return result;
    },



    parseLineValue : function(input) {
        var tokens = input.split(",");
        if ( tokens.length > 1 ) {
            var result = tokens[1].replace(/^\s+|\s+$/g,'');
            result = result.replace("'", '');
            result = result.replace(/\r/g, '');
            result = result.replace("');", '');
        }
        return result;
    }


}