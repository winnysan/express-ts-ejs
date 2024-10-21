type Environment = 'development'

const dataEnv = document.documentElement.getAttribute('data-env')

if (dataEnv === 'development') window.env = 'development'
