# frozen_string_literal: true

class AddDeviseRememberToken < ActiveRecord::Migration[6.0]
  def up
    add_column :users, :remember_token, :string
  end
end
