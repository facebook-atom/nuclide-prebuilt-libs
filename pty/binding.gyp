{
  'targets': [{
    'target_name': 'pty',
    'include_dirs' : [
      '<!(node -e "require(\'nan\')")'
    ],
    'cflags': [
      '-std=c++11'
    ],
    'xcode_settings': {
      'OTHER_CPLUSPLUSFLAGS': [
        '-std=c++11'
      ],
    },
    'conditions': [
      ['OS=="win"', {
        # "I disabled those warnings because of winpty" - @peters (GH-40)
        'msvs_disabled_warnings': [ 4506, 4530 ],
        'include_dirs' : [
          'deps/winpty/src/include',
        ],
        'dependencies' : [
          'deps/winpty/src/winpty.gyp:winpty-agent',
          'deps/winpty/src/winpty.gyp:winpty',
        ],
        'sources' : [
          'src/win/pty.cc'
        ],
        'libraries': [
          'shlwapi.lib'
        ],
      }, { # OS!="win"
        'sources': [
          'src/unix/pty.cc'
        ],
        'libraries': [
          '-lutil',
          '-L/usr/lib',
          '-L/usr/local/lib'
        ],
      }],
      # http://www.gnu.org/software/gnulib/manual/html_node/forkpty.html
      #   One some systems (at least including Cygwin, Interix,
      #   OSF/1 4 and 5, and Mac OS X) linking with -lutil is not required.
      ['OS=="mac" or OS=="solaris"', {
        'libraries!': [
          '-lutil'
        ]
      }],
    ]
  },
  {
    'target_name': 'action_after_build',
    'type': 'none',
    'dependencies': [ '<(module_name)' ],
    'conditions': [
      ['OS=="win"', {
        'copies': [
          {
            'files': [ '<(PRODUCT_DIR)/<(module_name).node' ],
            'destination': '<(module_path)'
          },
          {
            'files': [ '<(PRODUCT_DIR)/winpty.dll' ],
            'destination': '<(module_path)'
          },
          {
            'files': [ '<(PRODUCT_DIR)/winpty-agent.exe' ],
            'destination': '<(module_path)'
          }
        ]
      }, {
        'copies': [
          {
            'files': [ '<(PRODUCT_DIR)/<(module_name).node' ],
            'destination': '<(module_path)'
          }
        ]
      }],
    ],
  }]
}
