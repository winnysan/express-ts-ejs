import { deleteAsync } from 'del'
import { dest, series, src, task } from 'gulp'
import pkg from 'gulp-typescript'

const { createProject } = pkg
const tsProject = createProject('tsconfig.json')

task('typescript', () => {
  tsProject.config['exclude'] = ['./src/public/ts/**/*']
  return tsProject.src().pipe(tsProject()).js.pipe(dest('dist'))
})

task('build-clean', () => deleteAsync(['./dist']))

task('views', () => src('./src/views/**/*.ejs').pipe(dest('./dist/views')))

task('assets', () => src('./src/public/**/*').pipe(dest('./dist/public')))

task('default', series('build-clean', 'typescript', 'views', 'assets'), () => {
  console.log('Done')
})
