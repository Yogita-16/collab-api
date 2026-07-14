import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },

    description: {
      type: String,
      maxlength: [500, "Description too long"],
      default: "",
    },

    color: {
      type: String,
      default: "#3498db",
      match: [/^#[0-9A-F]{6}$/i, "Invalid color format"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "editor",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    taskCount: {
      type: Number,
      default: 0,
    },

    archived: {
      type: Boolean,
      default: false,
    },

    settings: {
      isPrivate: {
        type: Boolean,
        default: true,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
      allowAttachments: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true },
);

// Indexes
projectSchema.index({ userId: 1, archived: 1 });
projectSchema.index({ "members.userId": 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
