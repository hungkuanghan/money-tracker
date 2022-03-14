import Step from './Step';

const REMOTE_SERVER_URL = 'localhost';
const REMOTE_SERVER_PORT = '80';

function getCurrentTaskNum() {
  if (!localStorage.getItem('currentTask')) {
    return -1;
  }
  return parseInt(localStorage.getItem('currentTask') || '-1');
}

function sendTaskEndSignal() {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `http://${REMOTE_SERVER_URL}:${REMOTE_SERVER_PORT}/task-end`, true);
  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.send();
}

function sendTaskStartSignal() {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `http://${REMOTE_SERVER_URL}:${REMOTE_SERVER_PORT}/task-start`, true);
  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.send();
}

class TaskStep extends Step {
  tasks = [];

  constructor(tasks) {
    super();
    this.tasks = tasks;
  }

  promptTask(taskNum) {
    const background = Step.createLightbox();
    const task = this.tasks[taskNum - 1];
    
    const beginButton = document.createElement('span');
    beginButton.onclick = this.beginTask.bind(this);
    beginButton.textContent='Begin Task';
  
    const taskBlock = this.newTaskBlock({
      taskNum,
      button: beginButton,
      ...task,
    });
    
    background.appendChild(taskBlock);
  }

  display() {
    localStorage.setItem('currentTask', '1');
    this.promptTask(parseInt(localStorage.getItem('currentTask') || '-1'));
  }

  start() 
  {
    this.display();
  }

  endTask(buttonMenu) {
    sendTaskEndSignal();
    buttonMenu.parentNode.removeChild(buttonMenu);
    const nextTaskNum = getCurrentTaskNum() + 1;
    if (nextTaskNum <= this.tasks.length) {
      localStorage.setItem('currentTask', nextTaskNum.toString());
      this.promptTask(getCurrentTaskNum());
    } else {
      this.end();
    }
  }

  loadTaskComponents() {
    const buttonMenu = document.createElement("div");
    buttonMenu.className = 'during-task-block';
  
    const helpButton = document.createElement("div");
    helpButton.className = 'task-help';
    helpButton.textContent = '?';
    helpButton.onclick = () => this.promptHelp(getCurrentTaskNum());
  
    const finishTaskButton = document.createElement("div");
    finishTaskButton.className = 'finish-task-button';
    finishTaskButton.textContent = 'Finish Task';
    finishTaskButton.onclick = () => {
      const confirmEnd = window.confirm('Are you sure you want to finish this task?');
      if (confirmEnd) {
        this.endTask(buttonMenu);
      }
    }
  
    buttonMenu.appendChild(helpButton);
    buttonMenu.appendChild(finishTaskButton);
    document.body.appendChild(buttonMenu);
  }


  beginTask() {
    Step.removeLightbox();
    sendTaskStartSignal();
    this.loadTaskComponents();
  }

  newTaskBlock({ taskNum, taskTitle, scenario, taskDesc, button }) {
    const taskBlock = document.createElement("div");
    taskBlock.className = "task-block";
    const taskHeader = document.createElement("div");
    const headSpanOne = document.createElement("div");
    const headSpanTwo = document.createElement("div");
    headSpanOne.textContent = `Task ${taskNum} out of ${this.tasks.length}`;
    headSpanTwo.textContent = taskTitle;
  
    taskHeader.className = "task-block-header"
    taskHeader.appendChild(headSpanOne);
    taskHeader.appendChild(headSpanTwo);
    const p = document.createElement('p');
    p.innerHTML = `You are about begin task ${taskNum} of the usability study<br/><br/> \
    <u>Scenario</u>: ${scenario}<br/><br/> \
    <u>Task:</u> ${taskDesc}<br/><br/> \
    Please click on <b>Begin Task</b> to start the task, and click on <b>Finish Task</b> button to end the task.<br/><br/> \
    (If you want to view the task descriptions again during the test, click on <b>?</b> button.)`;
    const taskBlockCenter = document.createElement("div");
    taskBlockCenter.className = "task-block-center";
    taskBlockCenter.appendChild(p);
    const taskBlockFooter = document.createElement("div");
    taskBlockFooter.className = "task-block-footer";
    taskBlockFooter.appendChild(button);
    taskBlock.appendChild(taskHeader);
    taskBlock.appendChild(taskBlockCenter);
    taskBlock.appendChild(taskBlockFooter);
    return taskBlock;
  }
  
  promptHelp(taskNum) {
    const background = Step.createLightbox();
    const task = this.tasks[taskNum - 1]
    const returnButton = document.createElement('span');
    returnButton.onclick = Step.removeLightbox;
    returnButton.textContent='Return';
  
    const taskBlock = this.newTaskBlock({
      taskNum,
      button: returnButton,
      ...task,
    });
    
    background.appendChild(taskBlock);
  }
}

export default TaskStep;