import mongoose from "mongoose";

// Attachment Schema with auto _id generation
const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }, // ← CRITICAL: Enable _id auto-generation
);

// Subtask Schema with auto _id generation
const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

// Comment Schema with auto _id generation
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

// Main Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
      index: true,
    },

    description: {
      type: String,
      maxlength: [5000, "Description too long"],
      default: "",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
      index: true,
    },

    subtasks: [subtaskSchema], // ← Use schema with _id: true

    attachments: [attachmentSchema], // ← Use schema with _id: true

    comments: [commentSchema], // ← Use schema with _id: true

    tags: [String],

    metadata: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  { timestamps: true },
);

// Compound indexes
taskSchema.index({ projectId: 1, userId: 1 });
taskSchema.index({ projectId: 1, completed: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Text index for search
taskSchema.index({ title: "text", description: "text" });

const Task = mongoose.model("Task", taskSchema);
export default Task;
