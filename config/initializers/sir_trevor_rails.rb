# frozen_string_literal: true

# Required for 0.6 and up:
# https://github.com/madebymany/sir-trevor-rails#upgrade-guide-to-v060
class SirTrevorRails::Block
  def self.custom_block_types
    # You can define your custom block types directly here or in your engine config.
    Spotlight::Engine.config.sir_trevor_widgets
  end
  
  def self.from_hash(hash, parent = nil)
    hash = hash.deep_dup.with_indifferent_access
    type_klass(hash).new(hash, parent)
  end


end
