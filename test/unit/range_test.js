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

    runner.assertEqual(2, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(true, this.range.collapsed, "collapsed");
  },

  testSetEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);

    runner.assertEqual(1, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(false, this.range.collapsed, "collapsed");
  },

  testSetStartBefore: function() {
    var runner = this;

    this.range.setStartBefore($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(1, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(false, this.range.collapsed, "collapsed");
  },

  testSetStartAfter: function() {
    var runner = this;

    this.range.setStartAfter($('content'));
    this.range.setEnd($('content'), 2);

    runner.assertEqual(2, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(true, this.range.collapsed, "collapsed");
  },

  testSetEndBefore: function() {
    var runner = this;

    this.range.setEndBefore($('content'));

    runner.assertEqual(1, this.range.startOffset, "startOffset");
    runner.assertEqual(1, this.range.endOffset, "endOffset");
    runner.assertEqual(true, this.range.collapsed, "collapsed");
  },

  testSetEndAfter: function() {
    var runner = this;

    this.range.setEndAfter($('content'));
    this.range.setStart($('content'), 1);

    runner.assertEqual(1, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(false, this.range.collapsed, "collapsed");
  },

  testCollapseToStart: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(true);

    runner.assertEqual(1, this.range.startOffset, "startOffset");
    runner.assertEqual(1, this.range.endOffset, "endOffset");
    runner.assertEqual(true, this.range.collapsed, "collapsed");
  },

  testCollapseToEnd: function() {
    var runner = this;

    this.range.setStart($('content'), 1);
    this.range.setEnd($('content'), 2);
    this.range.collapse(false);

    runner.assertEqual(2, this.range.startOffset, "startOffset");
    runner.assertEqual(2, this.range.endOffset, "endOffset");
    runner.assertEqual(true, this.range.collapsed, "collapsed");
  },

  testSelectNode: function() {
    var runner = this;

    this.range.selectNode($('lorem'));

    runner.assertEqual(0, this.range.startOffset, "startOffset");
    runner.assertEqual(1, this.range.endOffset, "endOffset");
    runner.assertEqual(false, this.range.collapsed, "collapsed");
  },

  testSelectNodeContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));

    runner.assertEqual(0, this.range.startOffset, "startOffset");
    runner.assertEqual(1, this.range.endOffset, "endOffset");
    runner.assertEqual(false, this.range.collapsed, "collapsed");
  },

  testDeleteContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    this.range.deleteContents();

    runner.assertEqual("", $('lorem').innerHTML, "innerHTML");
  },

  testExtractContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.extractContents();

    runner.assertEqual("", $('lorem').innerHTML, "innerHTML");

    // IE document does not have any useful methods. Everyone else can just
    // read textContent, IE needs to append the fragment to another element
    // and read its innerHTML
    if (contents.textContent) {
      runner.assertEqual("Lorem ipsum", contents.textContent, "textContent");
    } else {
      var e = new Element('div');
      e.appendChild(contents);
      runner.assertEqual("Lorem ipsum", e.innerHTML, "textContent");
    }
  },

  testCloneContents: function() {
    var runner = this;

    this.range.selectNodeContents($('lorem'));
    var contents = this.range.cloneContents();

    runner.assertEqual("Lorem ipsum", $('lorem').innerHTML, "innerHTML");

    // IE document does not have any useful methods. Everyone else can just
    // read textContent, IE needs to append the fragment to another element
    // and read its innerHTML
    if (contents.textContent) {
      runner.assertEqual("Lorem ipsum", contents.textContent, "textContent");
    } else {
      var e = new Element('div');
      e.appendChild(contents);
      runner.assertEqual("Lorem ipsum", e.innerHTML, "textContent");
    }
  },

  testInsertNode: function() {
    var runner = this;

    var node = new Element('span', {id: 'inserted'}).update("inserted!");

    this.range.selectNode($('lorem'));
    this.range.insertNode(node);

    runner.assertEqual("inserted!", $('inserted').innerHTML, "innerHTML");
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

    runner.assertEqual(expected, $('lorem').innerHTML, "innerHTML");
  }
});
