import shell from 'shelljs'

shell.cp('-R', 'src/views', 'dist/')
shell.cp('-R', 'src/public', 'dist/')
shell.rm('dist/public/js/script.ts')
