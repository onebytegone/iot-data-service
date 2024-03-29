'use strict';

module.exports = (grunt) => {
   let config;

   config = {
      js: {
         gruntFile: 'Gruntfile.js',
         all: [
            'Gruntfile.js',
            './services/**/scripts/**/*.js',
            './services/**/src/**/*.js',
            './services/**/tests/**/*.js',
         ],
      },
      ts: {
         all: [
            './types/**/*.ts',
            './services/**/src/**/*.ts',
            './services/**/tests/**/*.ts',
         ],
         configs: {
            standards: 'tsconfig.json',
         },
      },
      commands: {
         tsc: './node_modules/.bin/tsc',
      },
      out: {
         test: [ './.nyc_output', 'coverage' ],
      },
   };

   grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         target: [ ...config.js.all, ...config.ts.all ],
         fix: {
            src: [ ...config.js.all, ...config.ts.all ],
            options: {
               fix: true,
            },
         },
      },

      exec: {
         options: {
            failOnError: true,
         },
         standards: {
            cmd: `${config.commands.tsc} -p ${config.ts.configs.standards} --pretty`,
         },
      },

      clean: {
         testOutput: config.out.test,
      },

      watch: {
         ts: {
            files: [ ...config.js.all, ...config.ts.all ],
            tasks: [ 'standards' ],
         },
         gruntFile: {
            files: [ config.js.gruntFile ],
            options: {
               reload: true,
            },
         },
      },
   });

   grunt.loadNpmTasks('grunt-eslint');
   grunt.loadNpmTasks('grunt-exec');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-watch');

   grunt.registerTask('standards', [ 'eslint:target', 'exec:standards' ]);
   grunt.registerTask('standards-fix', [ 'eslint:fix' ]);

   grunt.registerTask('develop', [ 'watch' ]);

   grunt.registerTask('default', [ 'standards' ]);
};
