SirTrevor.Blocks.Wysiwyg = (function() {

  return SirTrevor.Block.extend({
    type: 'wysiwyg',

    icon_name: "text",

    title: function() {
      return i18n.t('blocks:wysiwyg:title');
    },

    description: function() {
      return i18n.t('blocks:wysiwyg:description');
    },

    blockGroup: function() {
      return i18n.t("blocks:group:tamu")
    },

    formattable: true,

    toolbarEnabled: true,

    editorHTML: function() {
      return "<div class='tmce-" + this.blockID + " tinymce'></div>";
    },

    loadData: function(data) {
      this.$("div.tmce-" + this.blockID)[0].innerHTML = data.text;
    },

    onBlockRender: function() {
      var wb = this;
      tinyMCE.init({
        selector: "div.tmce-" + wb.blockID,
        inline: false,
        inline_styles: true,
        theme: 'silver',
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist autolink lists link charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code',
          'insertdatetime nonbreaking table directionality',
          'paste textpattern codesample quickbars emoticons',
          'fullscreen image media template imagetools noneditable help'
        ],
        toolbar: 'undo redo | insert | styleselect | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link | forecolor backcolor removeformat | table codesample | pagebreak | charmap emoticons | fullscreen preview save print | insertfile image media anchor codesample',
        setup: function(editor) {
          editor.on("change", function() {
            wb.blockStorage.data.text = editor.getContent();
          });
        }
      });
    }

  });

})();
