class ChangeActsAsTaggableIdToInteger < ActiveRecord::Migration[5.0]
  def change
    change_column :taggings, :taggable_id, :integer, using: 'taggable_id::integer'
  end
end
