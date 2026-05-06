import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.adminUserProfileEdit}>
      <div className={styles.vector14}>
        <div className={styles.vector8}>
          <p className={styles.userProfileEdit}>User Profile & Edit</p>
          <div className={styles.autoWrapper}>
            <p className={styles.name}>Name</p>
            <p className={styles.email}>Email</p>
            <p className={styles.phone}>Phone</p>
          </div>
          <div className={styles.autoWrapper2}>
            <div className={styles.group}>
              <div className={styles.vector}>
                <p className={styles.johnSmith}>John Smith</p>
              </div>
            </div>
            <div className={styles.group2}>
              <div className={styles.vector2}>
                <p className={styles.johnSmith}>john.smith@example.com</p>
              </div>
            </div>
            <div className={styles.group3}>
              <div className={styles.vector3}>
                <p className={styles.johnSmith}>1234567890</p>
              </div>
            </div>
          </div>
          <div className={styles.autoWrapper3}>
            <p className={styles.name}>Role</p>
            <p className={styles.status}>Status</p>
            <p className={styles.dateRegistered}>Date Registered</p>
          </div>
          <div className={styles.autoWrapper4}>
            <div className={styles.group4}>
              <div className={styles.vector4}>
                <p className={styles.johnSmith}>User</p>
                <img src="../image/moubvt5e-sc7fsn1.svg" className={styles.frame} />
              </div>
            </div>
            <div className={styles.vector6}>
              <div className={styles.vector5} />
            </div>
            <div className={styles.group5}>
              <div className={styles.vector7}>
                <p className={styles.johnSmith}>2021-07-16</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.vector10}>
          <p className={styles.loginHistory}>Login History</p>
          <div className={styles.autoWrapper5}>
            <p className={styles.name}>Timestamp</p>
            <p className={styles.name}>Device</p>
          </div>
          <div className={styles.autoWrapper6}>
            <p className={styles.a202310101000Am}>2023-10-10 10:00 AM</p>
            <p className={styles.a202310101000Am}>Chrome on Windows 10</p>
          </div>
          <div className={styles.autoWrapper7}>
            <p className={styles.a202310101000Am}>2023-09-28 09:45</p>
            <p className={styles.a202310101000Am}>Safari on iOS</p>
          </div>
          <div className={styles.autoWrapper8}>
            <p className={styles.a202310101000Am}>2023-09-20 14:30</p>
            <p className={styles.a202310101000Am}>Firefox on MacOS</p>
          </div>
          <div className={styles.vector9} />
        </div>
        <div className={styles.autoWrapper9}>
          <div className={styles.vector11}>
            <p className={styles.cancel}>Cancel</p>
          </div>
          <div className={styles.vector12}>
            <p className={styles.saveChanges}>Save Changes</p>
          </div>
        </div>
        <div className={styles.vector13} />
      </div>
      <div className={styles.vector15}>
        <div className={styles.autoWrapper10}>
          <p className={styles.manageNews}>Manage News</p>
          <img src="../image/moubvt5e-l1drzp2.svg" className={styles.frame2} />
        </div>
        <img src="../image/moubvt5e-56z8pdx.svg" className={styles.maskGroup} />
        <img src="../image/moubvt5e-hk7mld3.svg" className={styles.maskGroup2} />
        <p className={styles.categories}>Categories</p>
        <p className={styles.tagsManagement}>Tags Management</p>
        <div className={styles.autoWrapper11}>
          <p className={styles.manageNews}>Manage Reels</p>
          <img src="../image/moubvt5e-9xvvmgf.svg" className={styles.frame2} />
        </div>
        <p className={styles.addReel}>Add Reel</p>
        <p className={styles.allReelsList}>All Reels List</p>
        <p className={styles.userList}>User List</p>
        <p className={styles.allReelsList}>Block/Unblock Users</p>
        <div className={styles.autoWrapper12}>
          <img src="../image/moubvt5e-ce7yvfe.svg" className={styles.maskGroup3} />
          <img src="../image/moubvt5e-5173hyb.svg" className={styles.frame2} />
        </div>
        <p className={styles.pushNotifications}>Push Notifications</p>
        <p className={styles.allReelsList}>Past Notifications</p>
        <p className={styles.reportsAnalytics}>Reports / Analytics</p>
        <img src="../image/moubvt5e-kkkv6bx.svg" className={styles.maskGroup4} />
        <div className={styles.group6}>
          <p className={styles.logout}>Logout</p>
        </div>
      </div>
      <img src="https://via.placeholder.com/100x100" className={styles.vector16} />
      <div className={styles.vector18}>
        <div className={styles.vector17} />
        <p className={styles.usersManagement}>Users Management</p>
        <img src="../image/moubvt5e-5581t35.svg" className={styles.frame3} />
      </div>
      <p className={styles.dashboardOverview}>Dashboard (overview)</p>
      <div className={styles.group7}>
        <img src="../image/moubvt5g-x1h1zfv.png" className={styles.vector19} />
      </div>
    </div>
  );
}

export default Component;
