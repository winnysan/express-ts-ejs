import Layout from './lib/Layout'
import SpaRouter from './lib/SpaRouter'
import './localization'

/**
 * Main entry point of the application.
 * @description Initializes the SPA router and the layout components when the script is loaded.
 */
console.log(
  `%c${window.localization.getLocalizedText('scriptLoadedSuccessfully')}`,
  'color: white; background-color: green; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
)

/**
 * Initializes the SPA router with a callback to initialize the layout on navigation.
 */
new SpaRouter(() => {
  Layout.initialize()
})
