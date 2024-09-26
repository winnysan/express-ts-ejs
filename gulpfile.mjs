import { exec } from 'child_process'
import { deleteAsync } from 'del'
import fs from 'fs'
import { dest, series, src, task } from 'gulp'
import pkg from 'gulp-typescript'
import minimist from 'minimist'
import * as sass from 'sass'

const { createProject } = pkg
const tsProject = createProject('tsconfig.json')
const argv = minimist(process.argv.slice(1))

/**
 * clear previous build
 */
task('build-clean', () => deleteAsync(['./dist']))

/**
 * transpile backend to target folder
 */
task('typescript-transpile', () => {
  tsProject.config['exclude'] = ['./src/public/ts/**/*']
  return tsProject.src().pipe(tsProject()).js.pipe(dest('dist'))
})

/**
 * copy views to targer folder
 */
task('views-copy', () => src('./src/views/**/*.ejs').pipe(dest('./dist/views')))

/**
 * copy assets to targer folder
 */
task('assets-copy', () => src('./src/public/**/*', { encoding: false }).pipe(dest('./dist/public')))

/**
 * frontend processing by webpack
 */
task('webpack-build', done => {
  const env = argv.env || 'development'

  exec(`npx webpack --env=${env}`, (err, stdout, stderr) => {
    if (err) {
      return done(err)
    }
    // console.log(stdout)
    done()
  })
})

/**
 * update ejs template
 */
task('views-update', done => {
  const manifestPath = './dist/manifest.json'
  const ejsFilePath = './dist/views/layouts/main.ejs'

  fs.readFile(manifestPath, 'utf8', (err, data) => {
    if (err) {
      return done(err)
    }

    const manifest = JSON.parse(data)
    const scriptTag = `<script type="text/javascript" src="${manifest['/js/script.js']}" defer></script>`
    const styleTag = `<link rel="stylesheet" href="${manifest['/css/style.css']}" />`

    fs.readFile(ejsFilePath, 'utf8', (err, fileData) => {
      if (err) {
        return done(err)
      }

      const updatedFileData = fileData
        .replace(/<script type="text\/javascript" src="\/js\/.*\.js" defer><\/script>/, scriptTag)
        .replace(/<link rel="stylesheet" href="\/css\/.*\.css" \/>/, styleTag)

      fs.writeFile(ejsFilePath, updatedFileData, 'utf8', err => {
        if (err) {
          return done(err)
        }

        done()
      })
    })
  })
})

/**
 * compile style
 */
task('style-compile', done => {
  const timestamp = Math.floor(Date.now() / 1000)
  const cssFilename = `style.${timestamp}.css`
  const scssFilePath = './src/public/css/style.scss'
  const cssOutputPath = `./dist/public/css/${cssFilename}`
  const ejsFilePath = './dist/views/layouts/main.ejs'

  const result = sass.renderSync({
    file: scssFilePath,
    outputStyle: 'expanded',
  })

  fs.writeFile(cssOutputPath, result.css, err => {
    if (err) {
      return done(err)
    }

    fs.readFile(ejsFilePath, 'utf8', (err, fileData) => {
      if (err) {
        return done(err)
      }

      const updatedFileData = fileData.replace(
        /<link rel="stylesheet" href="\/css\/.*\.css" \/>/,
        `<link rel="stylesheet" href="/css/${cssFilename}" />`
      )

      fs.writeFile(ejsFilePath, updatedFileData, 'utf8', err => {
        if (err) {
          return done(err)
        }

        done()
      })
    })
  })
})

task(
  'default',
  series('build-clean', 'typescript-transpile', 'views-copy', 'assets-copy', 'webpack-build', 'views-update')
)
