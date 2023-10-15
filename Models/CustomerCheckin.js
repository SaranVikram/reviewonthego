const mongoose = require("mongoose")

const customerCheckinSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    isMsgOpen: {
      type: Boolean,
      default: false,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
  },
  {
    timestamps: true, // This will add 'createdAt' and 'updatedAt' fields
  }
)

const CustomerCheckin = mongoose.model("CustomerCheckin", customerCheckinSchema)

module.exports = CustomerCheckin
