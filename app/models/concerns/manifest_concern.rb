# frozen_string_literal: true

##
# A concern to be mixed into the SolrDocument class in order to provide
# convenient accessors for IIIF manifests embeded in a SolrDocument
module ManifestConcern
  def manifest
    manifest_url = fetch('iiif_manifest_url_ssi', nil)
    return if manifest_url.blank?
    manifest_url
  end
end
