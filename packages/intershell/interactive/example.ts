/**
 * Example: Simple Interactive CLI Application using InterShell Framework
 * 
 * This example demonstrates how to create a basic interactive CLI application
 * with page-based navigation and state management.
 */

import { colorify } from '@intershell/core';
import { createFramework, type Page, type InteractiveCLI } from './src/index.js';

// Define the application state
interface AppState {
  currentStep: number;
  userName: string;
  userEmail: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Define action types
type AppAction = 
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

// Initial state
const initialState: AppState = {
  currentStep: 0,
  userName: '',
  userEmail: '',
  preferences: {
    theme: 'light',
    notifications: true,
  },
};

// Welcome page
const welcomePage: Page<AppState, AppAction> = {
  id: 'welcome',
  title: 'Welcome to InterShell Demo',
  description: 'A demonstration of the InterShell interactive CLI framework',
  
  async render(cli: InteractiveCLI, state: AppState): Promise<void> {
    cli.writeLine(colorify.bold(colorify.blue('🚀 Welcome to InterShell Framework Demo!')));
    cli.writeLine();
    cli.writeLine('This is a simple example showing how to build interactive CLI applications');
    cli.writeLine('with page-based navigation and state management.');
    cli.writeLine();
    cli.writeLine(colorify.green('Features demonstrated:'));
    cli.writeLine('  • Page-based navigation');
    cli.writeLine('  • State management with reducers');
    cli.writeLine('  • Interactive key handling');
    cli.writeLine('  • Beautiful terminal output');
    cli.writeLine();
    cli.writeLine(colorify.yellow('Press Enter to continue, or Ctrl+C to exit'));
  },
  
  handleKey(key, state) {
    if (key.name === 'return') {
      return { type: 'NEXT_STEP' };
    }
    return null;
  },
  
  getNextAction(state) {
    if (state.currentStep > 0) {
      return { type: 'CHANGE_PAGE', payload: 'name-input' };
    }
    return { type: 'RE_RENDER' };
  },
};

// Name input page
const nameInputPage: Page<AppState, AppAction> = {
  id: 'name-input',
  title: 'User Information',
  description: 'Enter your name',
  
  async render(cli: InteractiveCLI, state: AppState): Promise<void> {
    cli.writeLine(colorify.bold('📝 User Setup - Step 1 of 3'));
    cli.writeLine();
    cli.writeLine('Please enter your name:');
    cli.writeLine();
    
    if (state.userName) {
      cli.writeLine(colorify.green(`Current name: ${state.userName}`));
      cli.writeLine();
      cli.writeLine('Press Enter to continue, or type a new name to change it');
    } else {
      cli.writeLine('Type your name and press Enter');
    }
    
    cli.writeLine();
    cli.writeLine(colorify.gray('Press Escape to go back'));
    cli.write(colorify.cyan('> '));
  },
  
  handleKey(key, state) {
    if (key.name === 'return' && state.userName) {
      return { type: 'NEXT_STEP' };
    }
    if (key.name === 'escape') {
      return { type: 'PREV_STEP' };
    }
    if (key.name && key.name.length === 1) {
      return { type: 'SET_NAME', payload: (state.userName || '') + key.name };
    }
    if (key.name === 'backspace' && state.userName) {
      return { type: 'SET_NAME', payload: state.userName.slice(0, -1) };
    }
    return null;
  },
  
  getNextAction(state) {
    if (state.currentStep > 1) {
      return { type: 'CHANGE_PAGE', payload: 'email-input' };
    }
    if (state.currentStep < 1) {
      return { type: 'CHANGE_PAGE', payload: 'welcome' };
    }
    return { type: 'RE_RENDER' };
  },
};

// Email input page
const emailInputPage: Page<AppState, AppAction> = {
  id: 'email-input',
  title: 'Email Address',
  description: 'Enter your email address',
  
  async render(cli: InteractiveCLI, state: AppState): Promise<void> {
    cli.writeLine(colorify.bold('📧 User Setup - Step 2 of 3'));
    cli.writeLine();
    cli.writeLine(`Hello ${colorify.green(state.userName)}! Please enter your email:`);
    cli.writeLine();
    
    if (state.userEmail) {
      cli.writeLine(colorify.green(`Current email: ${state.userEmail}`));
      cli.writeLine();
      cli.writeLine('Press Enter to continue, or type a new email to change it');
    } else {
      cli.writeLine('Type your email and press Enter');
    }
    
    cli.writeLine();
    cli.writeLine(colorify.gray('Press Escape to go back'));
    cli.write(colorify.cyan('> '));
  },
  
  handleKey(key, state) {
    if (key.name === 'return' && state.userEmail) {
      return { type: 'NEXT_STEP' };
    }
    if (key.name === 'escape') {
      return { type: 'PREV_STEP' };
    }
    if (key.name && key.name.length === 1) {
      return { type: 'SET_EMAIL', payload: (state.userEmail || '') + key.name };
    }
    if (key.name === 'backspace' && state.userEmail) {
      return { type: 'SET_EMAIL', payload: state.userEmail.slice(0, -1) };
    }
    return null;
  },
  
  getNextAction(state) {
    if (state.currentStep > 2) {
      return { type: 'CHANGE_PAGE', payload: 'preferences' };
    }
    if (state.currentStep < 2) {
      return { type: 'CHANGE_PAGE', payload: 'name-input' };
    }
    return { type: 'RE_RENDER' };
  },
};

// Preferences page
const preferencesPage: Page<AppState, AppAction> = {
  id: 'preferences',
  title: 'Preferences',
  description: 'Configure your preferences',
  
  async render(cli: InteractiveCLI, state: AppState): Promise<void> {
    cli.writeLine(colorify.bold('⚙️  User Setup - Step 3 of 3'));
    cli.writeLine();
    cli.writeLine(`Welcome ${colorify.green(state.userName)}! Configure your preferences:`);
    cli.writeLine();
    
    const themeColor = state.preferences.theme === 'dark' ? colorify.gray : colorify.yellow;
    const notifColor = state.preferences.notifications ? colorify.green : colorify.red;
    
    cli.writeLine(`Theme: ${themeColor(state.preferences.theme)} (Press 't' to toggle)`);
    cli.writeLine(`Notifications: ${notifColor(state.preferences.notifications ? 'enabled' : 'disabled')} (Press 'n' to toggle)`);
    cli.writeLine();
    cli.writeLine(colorify.green('Press Enter to finish setup'));
    cli.writeLine(colorify.gray('Press Escape to go back'));
  },
  
  handleKey(key, state) {
    if (key.name === 'return') {
      return { type: 'NEXT_STEP' };
    }
    if (key.name === 'escape') {
      return { type: 'PREV_STEP' };
    }
    if (key.name === 't') {
      return { type: 'SET_THEME', payload: state.preferences.theme === 'light' ? 'dark' : 'light' };
    }
    if (key.name === 'n') {
      return { type: 'TOGGLE_NOTIFICATIONS' };
    }
    return null;
  },
  
  getNextAction(state) {
    if (state.currentStep > 3) {
      return { type: 'CHANGE_PAGE', payload: 'summary' };
    }
    if (state.currentStep < 3) {
      return { type: 'CHANGE_PAGE', payload: 'email-input' };
    }
    return { type: 'RE_RENDER' };
  },
};

// Summary page
const summaryPage: Page<AppState, AppAction> = {
  id: 'summary',
  title: 'Setup Complete',
  description: 'Review your information',
  
  async render(cli: InteractiveCLI, state: AppState): Promise<void> {
    cli.writeLine(colorify.bold(colorify.green('✅ Setup Complete!')));
    cli.writeLine();
    cli.writeLine('Here\'s a summary of your information:');
    cli.writeLine();
    cli.writeLine(`${colorify.cyan('Name:')} ${state.userName}`);
    cli.writeLine(`${colorify.cyan('Email:')} ${state.userEmail}`);
    cli.writeLine(`${colorify.cyan('Theme:')} ${state.preferences.theme}`);
    cli.writeLine(`${colorify.cyan('Notifications:')} ${state.preferences.notifications ? 'enabled' : 'disabled'}`);
    cli.writeLine();
    cli.writeLine(colorify.bold('🎉 Thank you for trying InterShell Framework!'));
    cli.writeLine();
    cli.writeLine(colorify.yellow('Press any key to exit'));
  },
  
  handleKey(key, state) {
    return null; // Any key will exit via framework
  },
  
  getNextAction(state) {
    return { type: 'EXIT' };
  },
};

// Reducers for state management
const reducers = {
  main: (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case 'SET_NAME':
        return { ...state, userName: action.payload };
      
      case 'SET_EMAIL':
        return { ...state, userEmail: action.payload };
      
      case 'SET_THEME':
        return {
          ...state,
          preferences: { ...state.preferences, theme: action.payload }
        };
      
      case 'TOGGLE_NOTIFICATIONS':
        return {
          ...state,
          preferences: { ...state.preferences, notifications: !state.preferences.notifications }
        };
      
      case 'NEXT_STEP':
        return { ...state, currentStep: state.currentStep + 1 };
      
      case 'PREV_STEP':
        return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
      
      default:
        return state;
    }
  },
};

// Create and run the application
async function runExample() {
  console.log(colorify.bold(colorify.blue('Starting InterShell Framework Example...')));
  console.log();
  
  try {
    const framework = createFramework<AppState, AppAction>()
      .withInitialState(initialState)
      .withPages([welcomePage, nameInputPage, emailInputPage, preferencesPage, summaryPage])
      .withReducers(reducers)
      .withDebug(false)
      .build();
    
    // Add some event listeners
    framework.on('page:enter', ({ pageId }) => {
      console.log(colorify.gray(`[DEBUG] Entered page: ${pageId}`));
    });
    
    framework.on('state:change', ({ newState }) => {
      console.log(colorify.gray(`[DEBUG] State updated: step ${newState.currentStep}`));
    });
    
    // Run the application
    const finalState = await framework.run();
    
    console.log();
    console.log(colorify.green('Application completed successfully!'));
    console.log('Final state:', finalState);
    
  } catch (error) {
    console.error(colorify.red('Error running application:'), error);
    process.exit(1);
  }
}

// Export for use as a module or run directly
export { runExample };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample();
}