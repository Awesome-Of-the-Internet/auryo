import { EVENTS } from '@common/constants/events';
import { setLoginError, setLoginLoading } from '@common/store/auth/actions';
import { setToken } from '@common/store/config/actions';
import { app, clipboard, dialog, ipcMain, IpcMessageEvent, shell } from 'electron';
import { download } from 'electron-dl';
import * as _ from 'lodash';
import * as io from 'socket.io-client';
import { CONFIG } from '../../../config';
import { Logger } from '../../utils/logger';
import Feature from '../feature';

export default class IPCManager extends Feature {
  private logger = new Logger('IPCManager');

  private socket: SocketIOClient.Socket | null = null;

  register() {
    ipcMain.on(EVENTS.APP.VALID_DIR, (_e: IpcMessageEvent) => {
      const res = dialog.showOpenDialog({ properties: ['openDirectory'] });

      if (res && res.length) {
        this.sendToWebContents(EVENTS.APP.VALID_DIR_RESPONSE, res[0]);
      }

    });

    ipcMain.on(EVENTS.APP.RESTART, () => {
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      app.exit(0);
    });

    ipcMain.on(EVENTS.APP.RAISE, () => {
      if (this.win) {
        this.win.focus();
      }
    });
    ipcMain.on(EVENTS.APP.RELOAD, () => {
      if (this.win) {
        this.win.reload();
      }
    });

    ipcMain.on(EVENTS.APP.OPEN_EXTERNAL, (_e: IpcMessageEvent, arg: string) => {
      shell.openExternal(arg);
    });

    ipcMain.on(EVENTS.APP.WRITE_CLIPBOARD, (_e: IpcMessageEvent, arg: string) => {
      clipboard.writeText(arg);
    });

    ipcMain.on(EVENTS.APP.DOWNLOAD_FILE, (_e: IpcMessageEvent, url: string) => {
      const { config } = this.store.getState();

      const downloadSettings: any = {};

      if (!_.isEmpty(_.get(config, 'app.downloadPath'))) {
        downloadSettings.directory = config.app.downloadPath;
      }

      if (this.win) {
        download(this.win, url, downloadSettings)
          .then((dl) => this.logger.info('filed saved to', dl.getSavePath()))
          .catch(this.logger.error);
      }
    });

    ipcMain.on(EVENTS.APP.AUTH.LOGIN, () => {
      this.store.dispatch(setLoginLoading());

      this.logger.debug('Starting login');

      this.startLoginSocket();

    });
  }

  login = () => {
    this.logger.debug('Proceeding to login');
    if (this.socket) {
      shell.openExternal(CONFIG.getConnectUrl(this.socket.id));
      this.store.dispatch(setLoginLoading(false));
      this.socket.removeListener('connect', this.login);
    }
  }

  startLoginSocket = () => {

    const handleError = (err: any) => {
      this.store.dispatch(setLoginError('Something went wrong during login'));
      this.logger.error(err);

      if (this.socket) {
        this.socket.disconnect();
      }
    };

    if (!this.socket) {
      this.socket = io(CONFIG.BASE_URL, {
        timeout: 15000
      });

      this.socket.on('connect', this.login);

      this.socket.on('token', (data: string) => {
        this.logger.debug('Received token');

        this.store.dispatch(setToken(data));
        this.sendToWebContents('login-success');
      });

      this.socket.on('error', handleError);

      this.socket.on('connect_error', handleError);

      this.socket.on('connect_timeout', (err: any) => {
        this.store.dispatch(setLoginError('Timed out, login took longer than expected'));
        if (this.socket) {
          this.socket.disconnect();
        }
      });

      this.socket.on('disconnect', (reason: string) => {
        if (reason === 'io server disconnect' && this.socket) {
          this.socket.connect();
        }
      });
    } else {
      if (this.socket.disconnected) {
        this.socket.connect();
      } else {
        this.login();
      }
    }
  }
}
