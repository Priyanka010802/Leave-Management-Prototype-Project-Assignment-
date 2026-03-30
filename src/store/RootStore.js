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
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    
    const savedBalances = localStorage.getItem('leaveBalances');
    if (savedBalances) {
      this.leaveBalances = JSON.parse(savedBalances);
    } else {
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
        this.employees = response.body;
      
      });
    } catch (e) {
      console.error('Failed to load employees', e);
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
      runInAction(() => {
        this.serverTime = new Date(resp.body.currentTime);
      });
      return this.serverTime;
    } catch (e) {
      console.error('Failed to get server time', e);
      return new Date();
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
