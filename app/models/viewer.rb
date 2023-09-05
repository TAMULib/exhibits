# frozen_string_literal: true

##
# Model for viewer
class Viewer < ApplicationRecord
  belongs_to :exhibit, class_name: 'Spotlight::Exhibit'

  def to_partial_path
    return '../viewers/mirador'
  end
end
