import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.editTags}>
      <div className={styles.group}>
        <div className={styles.vector}>
          <p className={styles.aAddTag}>+ Add Tag</p>
        </div>
      </div>
      <div className={styles.vector3}>
        <div className={styles.group2}>
          <img src="../image/moubk1hc-ooni5lj.png" className={styles.vector2} />
        </div>
        <p className={styles.dashboardOverview}>Dashboard (overview)</p>
        <img src="../image/moubk1ha-vni6u0n.svg" className={styles.maskGroup} />
        <img src="../image/moubk1ha-s2hp0dg.svg" className={styles.maskGroup2} />
        <p className={styles.categories}>Categories</p>
        <p className={styles.tagsManagement}>Tags Management</p>
        <div className={styles.autoWrapper}>
          <p className={styles.manageReels}>Manage Reels</p>
          <img src="../image/moubk1ha-i22xu29.svg" className={styles.frame} />
        </div>
        <p className={styles.addReel}>Add Reel</p>
        <p className={styles.allReelsList}>All Reels List</p>
        <div className={styles.autoWrapper2}>
          <p className={styles.manageReels}>Users Management</p>
          <img src="../image/moubk1ha-n0t7ikc.svg" className={styles.frame} />
        </div>
        <p className={styles.allReelsList}>User List</p>
        <p className={styles.blockUnblockUsers}>Block/Unblock Users</p>
        <div className={styles.autoWrapper3}>
          <img src="../image/moubk1ha-gq6z596.svg" className={styles.maskGroup3} />
          <img src="../image/moubk1ha-456lqyf.svg" className={styles.frame} />
        </div>
        <p className={styles.allReelsList}>Push Notifications</p>
        <p className={styles.pastNotifications}>Past Notifications</p>
        <p className={styles.reportsAnalytics}>Reports / Analytics</p>
        <img src="../image/moubk1ha-r97ykf8.svg" className={styles.maskGroup4} />
        <div className={styles.group3}>
          <p className={styles.logout}>Logout</p>
        </div>
      </div>
      <div className={styles.vector5}>
        <div className={styles.vector4} />
        <p className={styles.manageNews}>Manage News</p>
        <img src="../image/moubk1ha-f3tprih.svg" className={styles.frame2} />
      </div>
      <div className={styles.group4}>
        <div className={styles.vector11}>
          <div className={styles.autoWrapper4}>
            <p className={styles.tagName}>Tag Name</p>
            <p className={styles.status}>Status</p>
            <p className={styles.dateCreated}>Date Created</p>
            <p className={styles.actions}>Actions</p>
          </div>
          <div className={styles.autoWrapper5}>
            <p className={styles.tagName}>Breaking</p>
            <div className={styles.vector6}>
              <img
                src="../image/moubk1ha-rkd023h.svg"
                className={styles.maskGroup5}
              />
            </div>
            <p className={styles.a20231001}>2023-10-01</p>
            <img src="../image/moubk1ha-t0skszh.svg" className={styles.frame3} />
            <img src="../image/moubk1ha-tvvveba.svg" className={styles.frame4} />
          </div>
          <div className={styles.vector7} />
          <div className={styles.autoWrapper6}>
            <p className={styles.tagName}>Trending</p>
            <div className={styles.vector8}>
              <img
                src="../image/moubk1ha-xbt3df0.svg"
                className={styles.maskGroup6}
              />
            </div>
            <p className={styles.a20230915}>2023-09-15</p>
            <img src="../image/moubk1ha-1t1tmrd.svg" className={styles.frame5} />
            <img src="../image/moubk1ha-2cl4otk.svg" className={styles.frame6} />
          </div>
          <div className={styles.vector9} />
          <div className={styles.autoWrapper7}>
            <p className={styles.tagName}>Elections</p>
            <div className={styles.vector10}>
              <img
                src="../image/moubk1ha-qd8r9gr.svg"
                className={styles.maskGroup5}
              />
            </div>
            <p className={styles.a20231001}>2023-08-20</p>
            <img src="../image/moubk1ha-2c1ekau.svg" className={styles.frame7} />
            <img src="../image/moubk1ha-0le9t9n.svg" className={styles.frame6} />
          </div>
          <div className={styles.vector9} />
        </div>
      </div>
      <div className={styles.vector16}>
        <p className={styles.manageTags}>Manage Tags</p>
        <div className={styles.vector15}>
          <p className={styles.editTag}>Edit Tag</p>
          <div className={styles.group5}>
            <div className={styles.vector12}>
              <p className={styles.editTagName}>Edit tag name</p>
            </div>
          </div>
          <div className={styles.autoWrapper8}>
            <div className={styles.vector13}>
              <p className={styles.cancel}>Cancel</p>
            </div>
            <div className={styles.vector14}>
              <p className={styles.aAddTag}>Update</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
