export type Dictionary = {
  navigation: {
    home: string
    login: string
    register: string
    logout: string
    dashboard: string
    admin: string
    newPost: string
    viewOlderPosts: string
  }
  title: {
    homePage: string
    loginPage: string
    registerPage: string
    dashboardPage: string
    adminPage: string
    newPostPage: string
    errorPage: string
  }
  form: {
    search: string
    name: string
    email: string
    password: string
    confirmPassword: string
    title: string
    body: string
    images: string
    login: string
    register: string
    addNewPost: string
  }
  validation: {
    isRequired: string
    emailIsRequired: string
    emailIsInvalid: string
    emailAlreadyExists: string
    passwordIsRequired: string
    passwordMustHaveAtLeast6Characters: string
    confirmPasswordIsRequired: string
    passwordsMustMatch: string
    invalidImageFormat: string
  }
  messages: {
    invalidCredentials: string
    youAreLoggedIn: string
    youAreRegisteredAndLoggedIn: string
    youAreLoggedOut: string
    notFound: string
    somethingWentWrong: string
    unauthorized: string
    error: string
  }
  logo: string
}
