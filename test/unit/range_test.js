new Test.Unit.Runner({
  setup: function() {
    $('content').update(
      "<strong id=\"lorem\">Lorem ipsum</strong> dolor sit amet, " +
      "<em id=\"consectetuer\">consectetuer</em> adipiscing elit."
    );

    function getSel() {
      if (window.getSelection)
        return window.getSelection();
      else
        return document.selection;
    }

    function getRange() {
      var selection = getSel();
      if (selection.getRangeAt)
        return selection.getRangeAt(0);
      else
        return new Range(document);
    }

    var range = document.createRange();
    range.selectNode($('content'));

    try {
      // TODO: Need to write this for IE selection
      var selection = getSel();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {};

    this.range = getRange();
  },

  testSetStart: function() {
    var runner = this;

    this.range.setStart($('content'), 2);
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 2);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, true);
  },

  testSetEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 1);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, false);
  },

  testSetStartBefore: function() {
    var runner = this;

    this.range.setStartBefore($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 1);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, false);
  },

  testSetStartAfter: function() {
    var runner = this;

    this.range.setStartAfter($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 2);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, true);
  },

  testSetEndBefore: function() {
    var runner = this;

    this.range.setEndBefore($('content'));

    runner.assertEqual(this.range.startOffset, 1);
    runner.assertEqual(this.range.endOffset, 1);
    runner.assertEqual(this.range.collapsed, true);
  },

  testSetEndAfter: function() {
    var runner = this;

    this.range.setEndAfter($('content'));
    this.range.setStart($('content'), 1);

    runner.assertEqual(this.range.startOffset, 1);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, false);
  },

  testCollapseToStart: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(true);

    runner.assertEqual(this.range.startOffset, 1);
    runner.assertEqual(this.range.endOffset, 1);
    runner.assertEqual(this.range.collapsed, true);
  },

  testCollapseToEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(false);

    runner.assertEqual(this.range.startOffset, 2);
    runner.assertEqual(this.range.endOffset, 2);
    runner.assertEqual(this.range.collapsed, true);
  },

  testSelectNode: function() {
    var runner = this;

    this.range.selectNode($('lorem'));

    runner.assertEqual(this.range.startOffset, 0);
    runner.assertEqual(this.range.endOffset, 1);
    runner.assertEqual(this.range.collapsed, false);
  },

  testSelectNodeContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));

    runner.assertEqual(this.range.startOffset, 0);
    runner.assertEqual(this.range.endOffset, 1);
    runner.assertEqual(this.range.collapsed, false);
  },

  testDeleteContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    this.range.deleteContents();

    runner.assertEqual($('lorem').innerHTML, "");
  },

  testExtractContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.extractContents();

    runner.assertEqual($('lorem').innerHTML, "");
    runner.assertEqual(contents.textContent, "Lorem ipsum");
  },

  testCloneContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.cloneContents();

    runner.assertEqual($('lorem').innerHTML, "Lorem ipsum");
    runner.assertEqual(contents.textContent, "Lorem ipsum");
  },

  testInsertNode: function() {
    var runner = this;

    var node = new Element('span', {id: 'inserted'}).update("inserted!");

    this.range.selectNode($('lorem'));
    this.range.insertNode(node);

    runner.assertEqual($('inserted').innerHTML, "inserted!");
  },

  testSurrondContents: function() {
    var runner = this;

    var node = new Element('span', {id: 'wrapper'});

    this.range.selectNodeContents($('lorem'));
    this.range.surroundContents(node);

    runner.assertEqual($('lorem').innerHTML, "<span id=\"wrapper\">Lorem ipsum</span>");
  }
});
