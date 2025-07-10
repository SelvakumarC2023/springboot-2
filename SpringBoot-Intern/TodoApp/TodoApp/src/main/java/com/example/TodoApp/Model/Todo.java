package com.example.TodoApp.Model;

public class Todo {

    private String task;
    private String TaskStatus;

    public Todo(String task, String taskStatus) {
        this.task = task;
        TaskStatus = taskStatus;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public String getTaskStatus() {
        return TaskStatus;
    }

    public void setTaskStatus(String taskStatus) {
        TaskStatus = taskStatus;
    }
}
