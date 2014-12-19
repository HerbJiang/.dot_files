mkdir /tmp/git-clone
git clone https://github.com/Lokaltog/powerline-fonts /tmp/git-clone
sudo mv /tmp/git-clone/powerline-fonts /usr/share/fonts/powerline-fonts
sudo fc-cache -v -f
