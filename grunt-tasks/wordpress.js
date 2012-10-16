require('./rebuild-schema.js');

module.exports = function( grunt ) {
  grunt.registerTask( 'wordpress', 'WORDPRESS', function() {

      console.log("Wordpress");

      grunt.task.run('rebuild-schema');

  });
};
