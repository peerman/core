var SRC_FILES_FOR_MINIFY = [
    'vendor/socket.io.js',
    'src/header.js',

    'vendor/ev.js',
    'vendor/debug.js',
    
    'src/init.js',
    'src/util.js',
    'src/peerSocket.js',
    'src/peerDirectory.js',
    'src/resourceManager.js',
    'src/connectionManager.js',
    'src/peerman.js',
    'src/main.js',

    'src/footer.js',
];

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: SRC_FILES_FOR_MINIFY,
        dest: './<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          './<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    watch: {
      scripts: {
        files: SRC_FILES_FOR_MINIFY,
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify']);

};