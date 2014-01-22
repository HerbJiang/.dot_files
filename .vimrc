"----------------- Vundle ----------------
"
set nocompatible " not compatible with the old-fashion vi mode
filetype off " required!

" http://www.erikzaadi.com/2012/03/19/auto-installing-vundle-from-your-vimrc/
" Setting up Vundle - the vim plugin bundler
let iCanHazVundle=1
let vundle_readme=expand('~/.vim/bundle/vundle/README.md')
if !filereadable(vundle_readme)
  echo "Installing Vundle.."
  echo ""
  silent !mkdir -p ~/.vim/bundle
  silent !git clone https://github.com/gmarik/vundle ~/.vim/bundle/vundle
  let iCanHazVundle=0
endif

set rtp+=~/.vim/bundle/vundle/
set rtp+=~/.vim/bundle/powerline/powerline/bindings/vim
call vundle#rc()

" let Vundle manage Vundle
" required!
Bundle 'gmarik/vundle'

" My Bundles here:
"
" original repos on github
Bundle 'Lokaltog/vim-easymotion'
Bundle 'Lokaltog/powerline'
Bundle 'airblade/vim-gitgutter'
"Bundle "MarcWeber/vim-addon-mw-utils"
"Bundle "tomtom/tlib_vim"
"Bundle 'Townk/vim-autoclose'
"Bundle 'kien/ctrlp.vim'
"Bundle 'scrooloose/nerdtree'
"Bundle 'majutsushi/tagbar'
Bundle 'tomtom/tcomment_vim'
Bundle 'tpope/vim-fugitive'
Bundle 'AnsiEsc.vim'
"Bundle 'davidhalter/jedi-vim'
"Bundle 'walm/jshint.vim'
Bundle 'HerbJiang/vim-colorschemes'

" DO INSTALL ALL BUNDLES WITH :BundleInstall!
"----------------- End Vundle --------------



" My defaults
filetype plugin indent on
filetype plugin on " enable loading the plugin files for specific file types
filetype indent on " enable loading the indent file for specific file types

"set guifont=Menlo:h14
"set guifont=Anonymous\ Pro\ for\ Powerline:h14
syntax on
colorscheme torte
set cursorline
set tabstop=4     " a tab is four spaces
set expandtab
set backspace=indent,eol,start
                  " allow backspacing over everything in insert mode
set autoindent    " always set autoindenting on
set copyindent    " copy the previous indentation on autoindenting
"set number        " always show line numbers
set shiftwidth=4  " number of spaces to use for autoindenting
set shiftround    " use multiple of shiftwidth when indenting with '<' and '>'
set showmode
set showmatch     " set show matching parenthesis
set ignorecase    " ignore case when searching
set smartcase     " ignore case if search pattern is all lowercase, case-sensitive otherwise
set smarttab      " insert tabs on the start of a line according to shiftwidth, not tabstop 
set hlsearch      " highlight search terms
set incsearch     " show search matches as you type
set nobackup
set noswapfile
set mouse=a
set t_Co=256 
set laststatus=2

set encoding=utf-8
set termencoding=utf-8
set fileencoding=utf-8

" --- PowerLine
let g:Powerline_symbols = 'unicode' " require fontpatcher

" EasyMotion
let g:EasyMotion_do_shade = 0

" DetectIndent
"
"autocmd BufReadPost * :DetectIndent 

" Copy to Mac clipboard (current line for normal mode, selected text for visual mode)
nmap <F2> :.w !pbcopy<CR><CR>
vmap <F2> :w !pbcopy<CR><CR>

" Paste
nmap <F3> :set paste!<CR>

" SET LIST
nmap <F4> :set list!<CR>
set listchars=tab:>.,trail:.,extends:#,nbsp:.

" NERDTree
nmap <F5> :NERDTree<CR>

" Tagbar
nmap <F8> :TagbarToggle<CR>
let g:tagbar_left=1

" Taglist
"let Tlist_Exit_OnlyWindow = 1
"nnoremap <F8> :TlistToggle<CR>
"
"
