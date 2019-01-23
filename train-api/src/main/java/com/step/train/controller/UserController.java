package com.step.train.controller;

//import com.step.train.repository.SsoUserRepository;
import com.step.train.domain.entity.SsoUser;
import com.step.train.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private static Logger logger = LoggerFactory.getLogger(UserController.class);


    /*@RequestMapping("/index")
    public ModelAndView index(){
        return new ModelAndView("api/user/index");
    }*/




    @RequestMapping("/s")
    public String s(){
        return "1";
    }

    /*@RequestMapping("/get_user")
    public SsoUser getUser(){
        SsoUser user = new SsoUser();
        user.setId(8);
        user.setRealName("力量");
        user.setBirthday(new Date());
        return user;
    }

    @RequestMapping(value = "/list")
    @ResponseBody
    public Page<SsoUser> getList(SsoUserQo ssoUserQo) {
        try {
            return userService.findPage(ssoUserQo);
        } catch(Exception e) {
            e.printStackTrace();
        }
        return null;
    }*/

    /*private static Logger logger = LoggerFactory.getLogger(ActorController.class);
    @Autowired
    private ActorRepository actorRepository;

    @RequestMapping("/index")
    public ModelAndView index(){
        return new ModelAndView("actor/index");
    }

    @RequestMapping(value="/{id}")
    public ModelAndView show(ModelMap model,@PathVariable Long id) {
        Actor actor = actorRepository.findOne(id);
        model.addAttribute("actor",actor);
        return new ModelAndView("actor/show");
    }

    @RequestMapping("/new")
    public ModelAndView create(){
        return new ModelAndView("actor/new");
    }

    @RequestMapping(value="/save", method = RequestMethod.POST)
    public String save(Actor actor) throws Exception{
        actorRepository.save(actor);
        logger.info("新增->ID={}", actor.getId());
        return "1";
    }

    @RequestMapping(value="/edit/{id}")
    public ModelAndView update(ModelMap model,@PathVariable Long id){
        Actor actor = actorRepository.findOne(id);
        model.addAttribute("actor",actor);
        return new ModelAndView("actor/edit");
    }

    @RequestMapping(method = RequestMethod.POST, value="/update")
    public String update(Actor actor) throws Exception{
        actorRepository.save(actor);
        logger.info("修改->ID="+actor.getId());
        return "1";
    }

    @RequestMapping(value="/delete/{id}",method = RequestMethod.GET)
    public String delete(@PathVariable Long id) throws Exception{
        Actor actor = actorRepository.findOne(id);
        actorRepository.delete(actor);
        logger.info("删除->ID="+id);
        return "1";
    }

    @RequestMapping(value="/list")
    public Page<Actor> list(HttpServletRequest request) throws Exception{
        String name = request.getParameter("name");
        String page = request.getParameter("page");
        String size = request.getParameter("size");
        Pageable pageable = new PageRequest(page==null? 0: Integer.parseInt(page), size==null? 10:Integer.parseInt(size),
                new Sort(Sort.Direction.DESC, "id"));

        return actorRepository.findAll(pageable);
    }*/

}
