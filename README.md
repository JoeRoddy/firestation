# Firestation Native Electron App

## Install

* **Note: requires a node version >= 6 and an npm version >= 3.**

First, clone this repo via git and then install dependencies.

**ProTip**: Install with [yarn](https://github.com/yarnpkg/yarn) for faster and safer installation

```bash
$ cd your-project-name && npm install
```

## Run

Run these two commands __simultaneously__ in different console tabs.

```bash
$ npm run hot-server
$ npm run start-hot
```

or run two servers with one command

```bash
$ npm run dev
```

# To Do

## Bugs
hangs when deleting many records

## Features
* error messages on bad query syntax   
* build commits into history, allow user to revert back to previous data
* collapse sidebar

### Keymap
* give shortcuts preview (ctrl+enter --> execute query, etc)
* allow users to add shortcuts to paste saved queries

### Workbook
* fix autocompletion, workbook should learn about common collections/props and use them as suggestions

### Query Translator
* javascript first, then ios or android

## Later
* implement ctrl-f : window.find like chrome