# Environment Selector
Enable and disable part of file. Use for fast change environments in development workflow

---

How-To Install
==============

Find this extension in https://extensions.gnome.org/
Enable extension

Or

Upload extension from github https://github.com/Amilitar/env_selector
Install extension

First start
===============
1. Specify environment path
  * Create environment path with next format

  ```shell script
   # common
   Base command which will be common for all environments

   # environment Alfa
   Command for Alfa environment

   # environment Bravo important
   # command for Bravo environment
   ```

  * Common section used for common command and this section does not show in dropdown menu
  * Environment section used for environment specific command. Show in dropdown menu.
      * Important attribute, that means this item will be red and bold
      * If all command in environment commented that means environment inactive, else active

2. Specify config file
  * Open ~/.config/env_selector/.config
  * Put path to the environment file
  * Save and reload extension Alt + F2, "r" and enter

