// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

// Use if using turbolinks gem
// require("@rails/ujs").start()
// require("turbolinks").start()
// require("@rails/activestorage").start()
// require("channels")

import "blacklight-gallery"
import "blacklight-oembed"
import "spotlight"
import "openseadragon"

// Turbo replaces Turbolinks + Rails UJS
import "@hotwired/turbo-rails"

// Active Storage (for file uploads / direct uploads)
import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

// ActionCable channels (if you use them)
import "channels"

// Bootstrap 5 + Popper (no jQuery required)
import * as Popper from "@popperjs/core"
window.Popper = Popper
import "bootstrap"

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
