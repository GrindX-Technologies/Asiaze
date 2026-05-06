import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.editReelScreen}>
      <div className={styles.vector15}>
        <div className={styles.autoWrapper}>
          <p className={styles.reelTitleHeadline}>Reel Title/Headline</p>
          <p className={styles.reelTitleHeadline}>Current Video</p>
        </div>
        <div className={styles.autoWrapper3}>
          <div className={styles.autoWrapper2}>
            <div className={styles.group}>
              <div className={styles.vector}>
                <p className={styles.currentReelTitle}>Current Reel Title</p>
              </div>
            </div>
            <p className={styles.summaryCaption}>Summary/Caption</p>
            <div className={styles.group2}>
              <div className={styles.vector2}>
                <p className={styles.currentReelTitle}>
                  Current summary text, limited to 60 words.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.group3}>
            <p className={styles.videoPreview}>Video Preview</p>
          </div>
        </div>
        <div className={styles.autoWrapper4}>
          <p className={styles.fullArticleLink}>Full Article Link</p>
          <div className={styles.vector3}>
            <p className={styles.replaceVideo}>Replace Video</p>
          </div>
        </div>
        <div className={styles.autoWrapper7}>
          <div className={styles.autoWrapper5}>
            <div className={styles.group4}>
              <div className={styles.vector4}>
                <p className={styles.currentReelTitle}>
                  https://currentarticlelink.com
                </p>
              </div>
            </div>
            <p className={styles.category}>Category</p>
            <div className={styles.group5}>
              <div className={styles.vector5}>
                <p className={styles.currentReelTitle}>Current Category</p>
                <img src="../image/moublz2f-auwik0n.svg" className={styles.frame} />
              </div>
            </div>
            <p className={styles.summaryCaption}>Language</p>
            <img src="../image/moublz2f-bozz5wy.svg" className={styles.group6} />
          </div>
          <div className={styles.autoWrapper6}>
            <p className={styles.reelTitleHeadline}>Current Thumbnail</p>
            <div className={styles.group7}>
              <p className={styles.videoPreview}>Thumbnail Preview</p>
            </div>
          </div>
        </div>
        <div className={styles.autoWrapper9}>
          <div className={styles.autoWrapper8}>
            <p className={styles.reelTitleHeadline}>Tags</p>
            <div className={styles.vector6}>
              <img
                src="../image/moublz2f-lpj4ji8.svg"
                className={styles.maskGroup}
              />
            </div>
          </div>
          <div className={styles.group8}>
            <p className={styles.tag2}>Tag2</p>
          </div>
          <div className={styles.group9}>
            <p className={styles.tag2}>Tag3</p>
          </div>
          <div className={styles.vector7}>
            <p className={styles.replaceVideo}>Replace Thumbnail</p>
          </div>
        </div>
        <p className={styles.sourceName}>Source Name</p>
        <div className={styles.group10}>
          <div className={styles.vector8}>
            <p className={styles.currentReelTitle}>Current Source Name</p>
          </div>
        </div>
        <p className={styles.duration}>Duration</p>
        <div className={styles.group11}>
          <div className={styles.vector9}>
            <p className={styles.currentReelTitle}>00:02:30</p>
          </div>
        </div>
        <div className={styles.autoWrapper10}>
          <p className={styles.featuredBreaking}>Featured/Breaking</p>
          <div className={styles.vector11}>
            <div className={styles.vector10} />
          </div>
          <p className={styles.enableComments}>Enable Comments</p>
          <div className={styles.vector12}>
            <div className={styles.vector10} />
          </div>
        </div>
        <div className={styles.autoWrapper11}>
          <div className={styles.vector13}>
            <p className={styles.replaceVideo}>Update</p>
          </div>
          <div className={styles.vector14}>
            <p className={styles.cancel}>Cancel</p>
          </div>
        </div>
      </div>
      <div className={styles.vector16}>
        <div className={styles.autoWrapper12}>
          <p className={styles.manageNews}>Manage News</p>
          <img src="../image/moublz2f-8g50j5h.svg" className={styles.frame2} />
        </div>
        <img src="../image/moublz2f-m9hz75p.svg" className={styles.maskGroup2} />
        <img src="../image/moublz2f-fcpplz0.svg" className={styles.maskGroup3} />
        <p className={styles.categories}>Categories</p>
        <p className={styles.tagsManagement}>Tags Management</p>
        <p className={styles.addReel}>Add Reel</p>
        <p className={styles.allReelsList}>All Reels List</p>
        <div className={styles.autoWrapper13}>
          <p className={styles.manageNews}>Users Management</p>
          <img src="../image/moublz2f-bz4c9k2.svg" className={styles.frame2} />
        </div>
        <p className={styles.userList}>User List</p>
        <p className={styles.allReelsList}>Block/Unblock Users</p>
        <div className={styles.autoWrapper14}>
          <img src="../image/moublz2f-myn4kca.svg" className={styles.maskGroup4} />
          <img src="../image/moublz2f-czq3ffs.svg" className={styles.frame2} />
        </div>
        <p className={styles.tagsManagement}>Push Notifications</p>
        <p className={styles.allReelsList}>Past Notifications</p>
        <p className={styles.reportsAnalytics}>Reports / Analytics</p>
        <img src="../image/moublz2f-zotl6bm.svg" className={styles.maskGroup5} />
      </div>
      <img src="https://via.placeholder.com/100x100" className={styles.vector17} />
      <div className={styles.vector19}>
        <div className={styles.vector18} />
        <p className={styles.manageReels}>Manage Reels</p>
        <img src="../image/moublz2f-tipgt66.svg" className={styles.frame3} />
      </div>
      <p className={styles.dashboardOverview}>Dashboard (overview)</p>
      <div className={styles.group12}>
        <img src="../image/moublz2k-ko30ppy.png" className={styles.vector20} />
      </div>
    </div>
  );
}

export default Component;
