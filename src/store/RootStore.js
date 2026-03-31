import { makeAutoObservable, runInAction } from 'mobx';
import api from '../utils/api';

class RootStore {
  currentUser = null;
  employees = [];
  leaves = [];
  leaveBalances = {};
  serverTime = null;

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
  }

  hydrate() {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse current user from storage:', e.message);
      this.currentUser = null;
    }
    
    try {
      const savedBalances = localStorage.getItem('leaveBalances');
      if (savedBalances) {
        this.leaveBalances = JSON.parse(savedBalances);
      } else {
        this.leaveBalances = {};
      }
    } catch (e) {
      console.warn('Failed to parse leave balances from storage:', e.message);
      this.leaveBalances = {};
    }
  }

  persist() {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
    localStorage.setItem('leaveBalances', JSON.stringify(this.leaveBalances));
  }

  async loadInitialData() {
    try {
      const response = await api.get('/employees');
      runInAction(() => {
        this.employees = Array.isArray(response.body) ? response.body : [];
      });
    } catch (e) {
      console.error('Failed to load employees:', e.message);
      
      runInAction(() => {
        this.employees = [];
      });
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user && user.role === 'Employee') {
      if (!this.leaveBalances[user.id]) {
        this.leaveBalances[user.id] = 24;
      }
    }
    this.persist();
  }

  logout() {
    this.currentUser = null;
    this.persist();
  }

  async fetchServerTime() {
    try {
      const resp = await api.get('/server-time');
      const timeStr = resp.body?.currentTime;
      runInAction(() => {
        if (timeStr) {
          this.serverTime = new Date(timeStr);
        } else {
          this.serverTime = new Date();
        }
      });
      return this.serverTime;
    } catch (e) {
      console.error('Failed to get server time:', e.message);
      const fallback = new Date();
      runInAction(() => {
        this.serverTime = fallback;
      });
      return fallback;
    }
  }

  get currentBalance() {
    if (!this.currentUser) return 24;
    return this.leaveBalances[this.currentUser.id] ?? 24;
  }

  deductLeaveDays(days) {
    if (this.currentUser) {
      const id = this.currentUser.id;
      const current = this.leaveBalances[id] ?? 24;
      this.leaveBalances[id] = current - days;
      this.persist();
    }
  }
}

export const store = new RootStore();
