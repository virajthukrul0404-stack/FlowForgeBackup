const taskInput = document.getElementById("taskInput")
const taskList = document.getElementById("taskList")

function addTask(){

let task = taskInput.value

if(task === "") return

let li = document.createElement("li")

li.innerText = task

li.onclick = function(){
li.style.textDecoration = "line-through"
}

taskList.appendChild(li)

taskInput.value = ""

}