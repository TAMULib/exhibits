# frozen_string_literal: true

if ENV["ASSETS_PRECOMPILE"] == "true"
  return
end

require 'i18n/backend/active_record'
require 'i18n/backend/fallbacks'

# Don't attempt any DB calls unless a connection is available
def db_ready?
  return false unless defined?(ActiveRecord::Base)

  ActiveRecord::Base.connection_pool.with_connection { |c| c.active? } rescue false
end

if db_ready?
  if ActiveRecord::Base.connection.data_source_exists?("translations")
    Translation = I18n::Backend::ActiveRecord::Translation unless defined?(Translation)
    ##
    # Sets up the new Spotlight Translation backend, backed by ActiveRecord. To
    # turn on the ActiveRecord backend, uncomment the following lines.

    I18n.backend = I18n::Backend::ActiveRecord.new
    I18n::Backend::ActiveRecord.include I18n::Backend::Memoize
    Translation.include Spotlight::CustomTranslationExtension
    I18n::Backend::Simple.include I18n::Backend::Memoize
    I18n::Backend::Simple.include I18n::Backend::Pluralization
    I18n::Backend::Simple.include I18n::Backend::Fallbacks

    I18n.backend = I18n::Backend::Chain.new(I18n.backend, I18n::Backend::Simple.new)
  end
end
