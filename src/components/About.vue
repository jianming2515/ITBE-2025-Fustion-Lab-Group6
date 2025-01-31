<template>
    <div class="about-overlay" v-if="isVisible" @click.self="close">
      <div class="about-container">
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="close">×</button>
        
        <!-- 项目介绍部分 -->
        <div class="section project-intro">
          <h2 class="project-title">TUM ITBE Fusion Lab </h2>
          <p class="project-description">
            In this module, students work in interdisciplinary groups (3-4 students/group), on design and software projects at a scientific level. The goal of the assignment is to create software to solve a typical problem from the application area of the built environment and to apply the software tool to a concrete problem. The tasks are linked to the research-relevant fields of work of the participating chairs and can range, for example, from the processing of recorded sensor data using artificial intelligence methods to questions of additive manufacturing for the built environment.
            <br>
            <br>
            The ITBE Fusion Lab 2023/24 consists of two core components: a design task and a software development task.
            <br>
            <br>
            You will be working in teams of 4-5 members from different backgrounds. As a team, you are asked to create a work plan for the semester including the assignment of tasks to individuals, defined work packages, and a workflow for the semester.
          </p>
        </div>
  
        <!-- 团队成员部分 -->
        <div class="section team-members">
          <h2 class="project-title">Team Members</h2>
          <div class="members-container">
            <div v-for="member in teamMembers" :key="member.name" class="member">
              <div class="avatar">
                <img :src="member.avatar" :alt="member.name">
              </div>
              <span class="member-name">{{ member.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    isVisible: Boolean
  })
  
  const emit = defineEmits(['close'])
  
  const teamMembers = [
    { name: 'Yi Zhang', avatar: './pic/member1.png' },
    { name: 'Ying Li', avatar: './pic/member2.png' },
    { name: 'Jian Ming', avatar: './pic/member3.png' },
    { name: 'Shahzaib Hameed', avatar: './pic/member4.png' },
    { name: 'Bopitiyage Bopitiya', avatar: './pic/member5.png' }
  ]
  
  const close = () => {
    emit('close')
  }
  </script>
  
  <style scoped>
  .about-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
    padding: 150px 380px 150px 380px; /* 增加左右间距 */
    box-sizing: border-box;
  }
  
  .about-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    background: #ffffff99;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.3);
    color: #666;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.5);
    color: #333;
  }
  
  .section {
    text-align: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    width: 100%;
    box-sizing: border-box; /* 确保 padding 不影响总宽度 */
    margin: 0 auto; /* 居中显示 */
  }
  
  .project-intro {
    width: 100%;
    margin-right: 0; /* 确保右侧没有额外边距 */
  }
  
  .team-members {
    
    width: 100%;
    margin-right: 0;
  }
  
  .project-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ffffff;
    display: inline-block;
  }
  
  .project-description {
    line-height: 1.6;
    color: #333;
    text-align: center;
    padding: 0 15px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .team-members h2 {
    margin-bottom: 25px;
    font-size: 20px;
    color: #333;
  }
  
  .members-container {
    display: flex;  /* 改为flex布局 */
    justify-content: center;  /* 水平居中 */
    flex-wrap: nowrap;  /* 不换行 */
    gap: 30px;
    padding: 20px 0;
    width: 100%;
    box-sizing: border-box;
    margin: 0 auto;
  }
  
  .member {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;  /* 防止成员卡片被压缩 */
    width: 150px;    /* 固定宽度 */
  }
  
  .avatar {
    width: 75px;    /* 再稍微加大头像 */
    height: 75px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .member-name {
    font-size: 16px;
    color: #333;
    white-space: nowrap;  /* 防止名字换行 */
  }
  
  /* 自定义滚动条样式 */
  .about-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .about-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .about-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  /* 确保没有其他样式影响标题 */
  .section h2 {
    font-size: 24px; /* 确保字体大小一致 */
    font-weight: 600;
  }
  </style>