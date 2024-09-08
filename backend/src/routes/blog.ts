import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from 'hono/jwt';


export const bookRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables :{
        userId : any;
    }
}>();


bookRouter.use('/*', async (c, next) => {
    const header=c.req.header("authorization") || "";
    const response= await verify(header,c.env.JWT_SECRET);
    
    if(response){
        c.set("userId",response.id);
        await next();
     
    }else{
        c.status(403);
        return c.json({error:"unauthorized"})
    }
   
  })

bookRouter.post('/', async(c) => {
    const userId =c.get('userId');
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
    
    const body =await c.req.json();
    const post =await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: userId
        }
    })
  });
  
bookRouter.put('/blog', async(c) => {
    const userId =c.get('userId');
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const body=await c.req.json();
    const post=await prisma.post.update({
        where :{
            id: body.id,
            authorId: userId
        },
        data: {
            title: body.title,
            content: body.content
        }
    })
    
    return c.text('update post')
  })
  
bookRouter.get('/:id', async(c) => {
    const id =c.req.param('id');
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

   const post = await prisma.post.findUnique({
    where: {
        id
    }
   })
    return c.json({
        post
    });
  })
  
bookRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

   const posts = await prisma.post.findMany({})
    return c.json({
        posts
    });
  })