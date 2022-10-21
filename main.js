// Modules to control application life and create native browser window
const {app, BrowserWindow, session} = require('electron')
const path = require('path')
//const os = require('os')
//TODO FIGURE OUT WHY AND HOW THE FUCK TO STOP MULTPLE WINDOWS FROM OPENING

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      allowEval: false, // This is the key!
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
 // mainWindow.loadFile('index.html')
  mainWindow.loadURL('https://ww4.gogoanimes.org')
  mainWindow.show()
  mainWindow.focus()


  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}




 
  // Note that in order to use the React DevTools extension, you'll need to 
  // download and unzip a copy of the extension. 


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.



app.whenReady().then(() => {
  createWindow()
  

  session.defaultSession.loadExtension(path.join( __dirname , '/Ext/gighmmpiobklfepjocnamgkkbiglidom/5.1.2_0'))

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



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
