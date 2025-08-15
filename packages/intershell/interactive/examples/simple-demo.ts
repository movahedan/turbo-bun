#!/usr/bin/env bun

/**
 * Simple InterShell Framework Demo
 * 
 * This example demonstrates the basic usage of the InterShell framework
 * with page-based navigation and state management.
 */

import { InterShellFramework, PageBuilder } from '../src/index.js';
import { colorify } from '@intershell/core';

// Define the application state
interface DemoState {
  user: {
    name: string;
    age: number;
    email: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  isComplete: boolean;
}

// Define action types for state management
type DemoAction = 
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_USER_AGE'; payload: number }
  | { type: 'SET_USER_EMAIL'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_NOTIFICATIONS'; payload: boolean }
  | { type: 'COMPLETE_SETUP' };

// Initial state
const initialState: DemoState = {
  user: {
    name: '',
    age: 0,
    email: '',
  },
  preferences: {
    theme: 'light',
    notifications: true,
  },
  isComplete: false,
};

// State reducers
const reducers = {
  SET_USER_NAME: (state: DemoState, action: DemoAction): DemoState => ({
    ...state,
    user: { ...state.user, name: (action as any).payload },
  }),
  
  SET_USER_AGE: (state: DemoState, action: DemoAction): DemoState => ({
    ...state,
    user: { ...state.user, age: (action as any).payload },
  }),
  
  SET_USER_EMAIL: (state: DemoState, action: DemoAction): DemoState => ({
    ...state,
    user: { ...state.user, email: (action as any).payload },
  }),
  
  SET_THEME: (state: DemoState, action: DemoAction): DemoState => ({
    ...state,
    preferences: { ...state.preferences, theme: (action as any).payload },
  }),
  
  SET_NOTIFICATIONS: (state: DemoState, action: DemoAction): DemoState => ({
    ...state,
    preferences: { ...state.preferences, notifications: (action as any).payload },
  }),
  
  COMPLETE_SETUP: (state: DemoState): DemoState => ({
    ...state,
    isComplete: true,
  }),
};

// Create pages
const pages = [
  // Welcome page
  PageBuilder.create<DemoState, DemoAction>('welcome', 'Welcome to InterShell Demo')
    .description('A demonstration of the InterShell framework')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold(colorify.blue('🚀 Welcome to InterShell Demo')));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      console.log('This demo will guide you through setting up a user profile');
      console.log('using the InterShell framework with page-based navigation.');
      console.log();
      console.log(colorify.gray('Press any key to continue...'));
      
      // Wait for any key press
      await new Promise<void>((resolve) => {
        const handler = () => {
          cli.offKeyPress(handler);
          resolve();
        };
        cli.onKeyPress(handler);
      });
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => ({ type: 'NEXT_PAGE' }))
    .build(),

  // Name input page
  PageBuilder.create<DemoState, DemoAction>('name', 'Enter Your Name')
    .description('Please provide your name')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('👤 Enter Your Name'));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      
      if (state.user.name) {
        console.log(colorify.green(`Current name: ${state.user.name}`));
        console.log();
      }
      
      const name = await cli.prompt('What is your name?', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      // Update state through action
      return { type: 'SET_USER_NAME', payload: name };
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => 
      state.user.name ? { type: 'NEXT_PAGE' } : { type: 'RE_RENDER' }
    )
    .build(),

  // Age input page
  PageBuilder.create<DemoState, DemoAction>('age', 'Enter Your Age')
    .description('Please provide your age')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('🎂 Enter Your Age'));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      console.log(colorify.blue(`Hello, ${state.user.name}!`));
      console.log();
      
      if (state.user.age > 0) {
        console.log(colorify.green(`Current age: ${state.user.age}`));
        console.log();
      }
      
      const ageStr = await cli.prompt('How old are you?', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      const age = parseInt(ageStr, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        console.log(colorify.red('Please enter a valid age (1-120)'));
        return null;
      }
      
      return { type: 'SET_USER_AGE', payload: age };
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => 
      state.user.age > 0 ? { type: 'NEXT_PAGE' } : { type: 'RE_RENDER' }
    )
    .build(),

  // Email input page
  PageBuilder.create<DemoState, DemoAction>('email', 'Enter Your Email')
    .description('Please provide your email address')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('📧 Enter Your Email'));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      
      if (state.user.email) {
        console.log(colorify.green(`Current email: ${state.user.email}`));
        console.log();
      }
      
      const email = await cli.prompt('What is your email address?', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      // Simple email validation
      if (!email.includes('@') || !email.includes('.')) {
        console.log(colorify.red('Please enter a valid email address'));
        return null;
      }
      
      return { type: 'SET_USER_EMAIL', payload: email };
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => 
      state.user.email ? { type: 'NEXT_PAGE' } : { type: 'RE_RENDER' }
    )
    .build(),

  // Preferences page
  PageBuilder.create<DemoState, DemoAction>('preferences', 'Set Preferences')
    .description('Configure your preferences')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('⚙️  Set Preferences'));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      
      // Theme selection
      const themeOptions = ['🌞 Light Theme', '🌙 Dark Theme'];
      const selectedTheme = await cli.select('Choose your theme:', themeOptions, {
        clearScreen: false,
      });
      
      const theme = selectedTheme[0].includes('Light') ? 'light' : 'dark';
      
      // Notifications
      const notifications = await cli.confirm('Enable notifications?', {
        clearScreen: false,
        defaultValue: state.preferences.notifications,
      });
      
      return [
        { type: 'SET_THEME', payload: theme },
        { type: 'SET_NOTIFICATIONS', payload: notifications },
      ];
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => ({ type: 'NEXT_PAGE' }))
    .build(),

  // Summary page
  PageBuilder.create<DemoState, DemoAction>('summary', 'Summary')
    .description('Review your information')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('📋 Summary'));
      console.log(colorify.cyan('─'.repeat(50)));
      console.log();
      console.log(colorify.bold('User Information:'));
      console.log(`  Name: ${colorify.green(state.user.name)}`);
      console.log(`  Age: ${colorify.green(state.user.age.toString())}`);
      console.log(`  Email: ${colorify.green(state.user.email)}`);
      console.log();
      console.log(colorify.bold('Preferences:'));
      console.log(`  Theme: ${colorify.green(state.preferences.theme)}`);
      console.log(`  Notifications: ${colorify.green(state.preferences.notifications ? 'Enabled' : 'Disabled')}`);
      console.log();
      
      const confirmed = await cli.confirm('Is this information correct?', {
        clearScreen: false,
        defaultValue: true,
      });
      
      if (confirmed) {
        return { type: 'COMPLETE_SETUP' };
      }
      
      return null;
    })
    .handleKey((key, state) => null)
    .getNextAction((state) => 
      state.isComplete ? { type: 'EXIT' } : { type: 'PREV_PAGE' }
    )
    .build(),
];

// Create and run the framework
async function runDemo() {
  console.log(colorify.rainbow('🎉 Starting InterShell Framework Demo'));
  console.log();

  const framework = new InterShellFramework(
    initialState,
    pages,
    reducers,
    {
      debug: false,
      logLevel: 'info',
      enableHistory: true,
    }
  );

  // Set up event listeners
  framework.on('pageChange', ({ from, to }) => {
    console.log(colorify.gray(`[Navigation] ${from} → ${to}`));
  });

  framework.on('stateChange', ({ oldState, newState }) => {
    console.log(colorify.gray('[State] Updated'));
  });

  try {
    const finalState = await framework.run();
    
    console.log();
    console.log(colorify.bold(colorify.green('✅ Setup Complete!')));
    console.log();
    console.log('Final state:', JSON.stringify(finalState, null, 2));
    
  } catch (error) {
    console.log();
    console.log(colorify.red('❌ Demo failed:'), error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (import.meta.main) {
  runDemo();
}

export { runDemo };