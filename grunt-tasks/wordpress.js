require('./rebuild-schema.js');

module.exports = function( grunt ) {
  grunt.registerTask( 'wordpress', 'WORDPRESS', function() {

      console.log("Wordpress");

      var done = this.async();
      grunt.helper('rebuild-schema');


  });
};
