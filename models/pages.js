const mongoose = require("mongoose");


const blockSettingsSchema = new mongoose.Schema(
  {
    width: { type: String, enum: ["contained", "wide", "full"], default: "contained" },
    align: { type: String, enum: ["left", "center", "right"], default: "left" },
    contentAlign: { type: String, enum: ["left", "center", "right"], default: "left" },
    background: { type: String, default: "transparent" },
    textColor: { type: String, default: "" },
    paddingY: { type: Number, default: 16 },
    paddingX: { type: Number, default: 16 },
  },
  { _id: false }
);

const columnSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    value: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
    imageWidth: {
      type: Number,
      default: 100,
    },
    imageHeight: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const blockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["heading", "text", "image", "spacer", "columns"],
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    settings: {
      type: blockSettingsSchema,
      default: () => ({}),
    },

   
    value: {
      type: String,
      default: "",
    },

    level: {
      type: String,
      enum: ["h1", "h2", "h3"],
    },

   
    alt: {
      type: String,
      default: "",
    },
    imageWidth: {
      type: Number,
      default: 100,
    },
    imageHeight: {
      type: Number,
      default: null,
    },


    height: {
      type: Number,
    },

    columns: {
      type: [columnSchema],
      default: undefined,
    },
  },
  { _id: false }
);

const pagesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    background: {
      type: String,
      default: "#ffffff",
    },

    content: {
      type: [blockSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("pages", pagesSchema);