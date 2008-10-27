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

    function selectRange(range) {
      var selection = getSel();
      selection.removeAllRanges();

      if (Prototype.Browser.IE)
        selection._addRange(range);
      else
        selection.addRange(range);
    }

    var range = document.createRange();
    range.selectNode($('content'));
    selectRange(range);

    this.range = getRange();
  },

  testSetStart: function() {
    var runner = this;

    this.range.setStart($('content'), 2);
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 2, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, true, "collapsed");
  },

  testSetEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 1, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, false, "collapsed");
  },

  testSetStartBefore: function() {
    var runner = this;

    this.range.setStartBefore($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 1, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, false, "collapsed");
  },

  testSetStartAfter: function() {
    var runner = this;

    this.range.setStartAfter($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(this.range.startOffset, 2, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, true, "collapsed");
  },

  testSetEndBefore: function() {
    var runner = this;

    this.range.setEndBefore($('content'));

    runner.assertEqual(this.range.startOffset, 1, "startOffset");
    runner.assertEqual(this.range.endOffset, 1, "endOffset");
    runner.assertEqual(this.range.collapsed, true, "collapsed");
  },

  testSetEndAfter: function() {
    var runner = this;

    this.range.setEndAfter($('content'));
    this.range.setStart($('content'), 1);

    runner.assertEqual(this.range.startOffset, 1, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, false, "collapsed");
  },

  testCollapseToStart: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(true);

    runner.assertEqual(this.range.startOffset, 1, "startOffset");
    runner.assertEqual(this.range.endOffset, 1, "endOffset");
    runner.assertEqual(this.range.collapsed, true, "collapsed");
  },

  testCollapseToEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(false);

    runner.assertEqual(this.range.startOffset, 2, "startOffset");
    runner.assertEqual(this.range.endOffset, 2, "endOffset");
    runner.assertEqual(this.range.collapsed, true, "collapsed");
  },

  testSelectNode: function() {
    var runner = this;

    this.range.selectNode($('lorem'));

    runner.assertEqual(this.range.startOffset, 0, "startOffset");
    runner.assertEqual(this.range.endOffset, 1, "endOffset");
    runner.assertEqual(this.range.collapsed, false, "collapsed");
  },

  testSelectNodeContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));

    runner.assertEqual(this.range.startOffset, 0, "startOffset");
    runner.assertEqual(this.range.endOffset, 1, "endOffset");
    runner.assertEqual(this.range.collapsed, false, "collapsed");
  },

  testDeleteContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    this.range.deleteContents();

    runner.assertEqual($('lorem').innerHTML, "", "innerHTML");
  },

  testExtractContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.extractContents();

    runner.assertEqual($('lorem').innerHTML, "", "innerHTML");
    runner.assertEqual(contents.textContent, "Lorem ipsum", "textContent");
  },

  testCloneContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.cloneContents();

    runner.assertEqual($('lorem').innerHTML, "Lorem ipsum", "innerHTML");
    runner.assertEqual(contents.textContent, "Lorem ipsum", "textContent");
  },

  testInsertNode: function() {
    var runner = this;

    var node = new Element('span', {id: 'inserted'}).update("inserted!");

    this.range.selectNode($('lorem'));
    this.range.insertNode(node);

    runner.assertEqual($('inserted').innerHTML, "inserted!", "innerHTML");
  },

  testSurrondContents: function() {
    var runner = this;

    var node = new Element('span', {id: 'wrapper'});

    this.range.selectNodeContents($('lorem'));
    this.range.surroundContents(node);

    var expected;
    if (Prototype.Browser.IE)
      expected = "<SPAN id=wrapper>Lorem ipsum</SPAN>";
    else
      expected = "<span id=\"wrapper\">Lorem ipsum</span>";

    runner.assertEqual($('lorem').innerHTML, expected, "innerHTML");
  }
});
