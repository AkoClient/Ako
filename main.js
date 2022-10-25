// Modules to control application life and create native browser window
const {app, BrowserWindow, session} = require('electron')
const path = require('path')
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const client = require('discord-rich-presence')('1033927014995992596');
//const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");

//stop it from blocking stuffs
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

//intilize mainWindow so it can be refrenced everywhere
let mainWindow = null;

function createWindow () {


// Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      allowEval: false, // This is the key!
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      //icon: path.join(__dirname,'/images/icon.png')
    },
    autoHideMenuBar: true,
  //  titleBarStyle: 'hidden',
  })

  //Set title ;>
  mainWindow.setTitle('Gogoanime Desktop');
  mainWindow.on('page-title-updated', function(e) {
    e.preventDefault()
  });

  //dont allow any other URLS other than gogoanime
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'https://ww4.gogoanimes.org') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            allowEval: false, // This is the key!
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
          }
        }
      }
    }
    return { action: 'deny' }
  })

  // and load the index.html of the app.
 // mainWindow.loadFile('index.html')
  mainWindow.loadURL('https://ww4.gogoanimes.org')
  mainWindow.show()
  mainWindow.focus()

 


  //mainWindow.webContents.insertCSS('html, body { overflow: hidden;  }')
 //mainWindow.webContents.insertCSS('html, .logo { display: block; -moz-box-sizing: border-box; box-sizing: border-box; background: url(https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2022-07/kitten-playing-575035.jpg) no-repeat; }')
 // mainWindow.webContents.insertCSS('html, .wrapper_inside { overflow-y: scroll; padding-right: 0px; }')
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}



app.whenReady().then(() => {

  client.updatePresence({
    state: 'Watching: ',
   // details: '',
    //startTimestamp: Date.now(),
   // endTimestamp: Date.now() + 1337,
    largeImageKey: 'img_main',
    //smallImageKey: 'snek_small',
    instance: true,
  });


//blocker
  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(session.defaultSession);
  });

  createWindow()

   //console.log(mainWindow.webContents.getURL())

  
//load ublock
 // session.defaultSession.loadExtension(path.join( __dirname , '/Ext/ublock/1.44.4_0/'))

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

