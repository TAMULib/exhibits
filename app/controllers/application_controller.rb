class ApplicationController < ActionController::Base
  helper Openseadragon::OpenseadragonHelper
  # Adds a few additional behaviors into the application controller
  include Blacklight::Controller
  include Spotlight::Controller

  layout :determine_layout if respond_to? :layout

  add_breadcrumb "Digital Collections", Rails.application.config.collections_url

  def after_sign_in_path_for(resource)
    ENV['SAML_SIGN_IN_SUCCESS_PATH'] || '/'
  end

end
