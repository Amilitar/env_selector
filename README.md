# Enviroment Selector
Enable and disable part of file. Use for fast change enviroments in development workflow

---

How-To Install
==============

Find this extention in https://extensions.gnome.org/
Enable extension

Or

Upload extension from github https://github.com/Amilitar/env_selector
Install extension

First start
===============
1. Specify enviroment path
    * Create enviroment path with next format

    ```shell script
    # common
    Base command which will be common for all enviroments

    # enviroment Alfa
    Command for Alfa enviroment

    # enviromen Bravo important
    # command for Bravo enviromend
    ```

    * Common section used for common command and this section doesn`t to show in dropdown menu
    * Enviroment section used for enviromet specific command. Show in dropdown menu. 
        * Important attribute, that means this item wil be red and bold
        * If all command in enviromet commented that means enviroment unactive, else active

2. Specify config file
    * Open ~/.config/env_selector/.config
    * Put path to the enviroment file
    * Save and reload extension Alt + F2, "r" and enter 